import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// POST - Crear nuevo usuario
export async function POST(request: Request) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();
    const { email, password, nombre_completo, rol, puede_comprar, telefono } = body;

    // Validaciones
    if (!email || !password || !nombre_completo || !rol) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Obtener la primera empresa activa (Quillay SPA)
    const { data: empresa } = await adminClient
      .from('empresas')
      .select('id')
      .eq('activa', true)
      .limit(1)
      .single();

    if (!empresa) {
      return NextResponse.json(
        { error: 'No hay empresas activas en el sistema' },
        { status: 500 }
      );
    }

    // Crear usuario en auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre_completo,
        rol,
        puede_comprar: puede_comprar || false,
        empresa_id: empresa.id
      }
    });

    if (authError) {
      console.error('Error al crear usuario en auth:', authError);
      return NextResponse.json(
        { error: authError.message || 'Error al crear usuario' },
        { status: 400 }
      );
    }

    // Crear usuario en tabla usuarios
    const { error: dbError } = await adminClient
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email,
        nombre_completo,
        rol,
        puede_comprar: puede_comprar || false,
        activo: true,
        telefono: telefono || null,
        empresa_id: empresa.id
      });

    if (dbError) {
      console.error('Error al crear usuario en tabla:', dbError);
      
      // Intentar eliminar el usuario de auth si falla la inserción en la tabla
      await adminClient.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: 'Error al guardar datos del usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Usuario creado correctamente',
      user: {
        id: authData.user.id,
        email,
        nombre_completo,
        rol
      }
    });

  } catch (error: any) {
    console.error('Error en POST /api/admin/usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar usuario existente
export async function PATCH(request: Request) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();
    const { id, nombre_completo, rol, puede_comprar, activo, telefono } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Actualizar en la tabla usuarios
    const { error: dbError } = await adminClient
      .from('usuarios')
      .update({
        nombre_completo,
        rol,
        puede_comprar,
        activo,
        telefono
      })
      .eq('id', id);

    if (dbError) {
      console.error('Error al actualizar usuario:', dbError);
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }

    // Actualizar metadata en auth.users
    const { error: authError } = await adminClient.auth.admin.updateUserById(id, {
      user_metadata: {
        nombre_completo,
        rol,
        puede_comprar
      }
    });

    if (authError) {
      console.error('Error al actualizar auth metadata:', authError);
      // No retornamos error porque la actualización en la tabla sí funcionó
    }

    return NextResponse.json({
      message: 'Usuario actualizado correctamente'
    });

  } catch (error: any) {
    console.error('Error en PATCH /api/admin/usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: Request) {
  try {
    const adminClient = createAdminClient();

    // Obtener el ID del usuario a eliminar desde la URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const { data: usuarioAEliminar } = await adminClient
      .from('usuarios')
      .select('email, rol')
      .eq('id', userId)
      .single();

    if (!usuarioAEliminar) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el usuario de la tabla usuarios
    const { error: dbError } = await adminClient
      .from('usuarios')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('Error al eliminar usuario de la tabla:', dbError);
      return NextResponse.json(
        { error: 'Error al eliminar usuario de la base de datos' },
        { status: 500 }
      );
    }

    // Eliminar el usuario de auth.users
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error al eliminar usuario de auth:', authError);
      // No retornamos error porque ya se eliminó de la tabla
    }

    return NextResponse.json({
      message: 'Usuario eliminado correctamente',
      email: usuarioAEliminar.email
    });

  } catch (error: any) {
    console.error('Error en DELETE /api/admin/usuarios:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}