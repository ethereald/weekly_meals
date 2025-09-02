import { NextResponse } from 'next/server';
import { getMeals, addMeal, deleteMeal, updateMealDish, updateMealOrder } from '@/lib/meals';

// Single PUT handler supporting both dish edit and reorder
export async function PUT(request: Request) {
  const body = await request.json();
  if (body.reorder) {
    // Reorder request
    const { date, username, orderedIds } = body;
    if (!date || !username || !Array.isArray(orderedIds)) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }
    const updated = updateMealOrder(date, username, orderedIds);
    if (updated) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Reorder failed' }, { status: 400 });
    }
  } else {
    // Edit dish name
    const { id, dish } = body;
    if (!id || !dish) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }
    const updated = updateMealDish(Number(id), dish);
    if (updated) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Meal not found' }, { status: 404 });
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
  }
  const result = deleteMeal(Number(id));
  if (result) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: 'Meal not found' }, { status: 404 });
  }
}

export async function GET() {
  return NextResponse.json(getMeals());
}


export async function POST(request: Request) {
  const { date, username, dish } = await request.json();
  if (!date || !username || !dish) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
  }
  const meal = addMeal(date, username, dish);
  return NextResponse.json({ success: true, meal });
}
