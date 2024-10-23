// app/api/cancel-recurring-payment/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const recId = searchParams.get('recId');

    if (!recId) {
        return NextResponse.json(
            { status: 'error', message: 'Missing recId' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `https://mautskebeli.wpenginepowered.com/wp-json/wp/v2/cancel-recurring-payment/?recId=${recId}`,
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
