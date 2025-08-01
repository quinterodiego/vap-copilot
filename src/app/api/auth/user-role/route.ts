import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFromSheets, hasRole, isAdmin } from '@/lib/users-sheets';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ role: 'user', isAdmin: false }, { status: 200 });
    }

    const user = await getUserFromSheets(session.user.email);
    
    if (user) {
      return NextResponse.json({
        role: user.role,
        isAdmin: isAdmin(user),
        hasModeratorRole: hasRole(user, 'moderator'),
        email: user.email
      }, { status: 200 });
    }

    // Fallback: verificar si es admin por email
    const adminEmails = ['d86webs@gmail.com'];
    const isAdminByEmail = adminEmails.includes(session.user.email);
    
    return NextResponse.json({
      role: isAdminByEmail ? 'admin' : 'user',
      isAdmin: isAdminByEmail,
      hasModeratorRole: false,
      email: session.user.email
    }, { status: 200 });

  } catch (error) {
    console.error('Error al verificar rol de usuario:', error);
    
    // En caso de error, devolver info básica
    const session = await getServerSession(authOptions);
    const adminEmails = ['d86webs@gmail.com'];
    const isAdminByEmail = session?.user?.email ? adminEmails.includes(session.user.email) : false;
    
    return NextResponse.json({
      role: isAdminByEmail ? 'admin' : 'user',
      isAdmin: isAdminByEmail,
      hasModeratorRole: false,
      email: session?.user?.email || null
    }, { status: 200 });
  }
}
