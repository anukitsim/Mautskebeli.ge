// app/api/cancel-recurring-payment/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const recId = searchParams.get('recId');
    const token = searchParams.get('token') || '';

    if (!recId) {
        return NextResponse.json(
            { status: 'error', message: 'Missing recId' },
            { status: 400 }
        );
    }

    try {
        const params = new URLSearchParams({ recId });
        if (token) params.set('token', token);
        const response = await fetch(
            `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/cancel-recurring-payment/?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { status: 'error', message: 'Failed to cancel recurring payment' },
            { status: 500 }
        );
    }
}
