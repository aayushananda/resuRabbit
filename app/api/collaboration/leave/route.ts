import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to leave a collaboration room' },
        { status: 401 }
      );
    }
    
    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body to get the room ID
    const body = await request.json();
    const { roomId } = body;
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the room exists
    const room = await prisma.collaborationRoom.findUnique({
      where: { id: roomId },
      include: {
        participants: true
      }
    });
    
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the owner of the room
    if (room.ownerId === user.id) {
      return NextResponse.json(
        { error: 'Room owner cannot leave the room. You can delete the room instead.' },
        { status: 400 }
      );
    }
    
    // Check if user is a participant in the room
    const isParticipant = room.participants.some(participant => participant.userId === user.id);
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this room' },
        { status: 400 }
      );
    }
    
    // Find the participant record
    const participantRecord = await prisma.collaborationRoomUser.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: user.id
        }
      }
    });
    
    if (!participantRecord) {
      return NextResponse.json(
        { error: 'Participant record not found' },
        { status: 404 }
      );
    }
    
    // Remove user from the room's participants
    await prisma.collaborationRoomUser.delete({
      where: {
        id: participantRecord.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Successfully left the collaboration room'
    });
  } catch (error) {
    console.error('Error leaving collaboration room:', error);
    return NextResponse.json(
      { error: 'Failed to leave collaboration room' },
      { status: 500 }
    );
  }
} 