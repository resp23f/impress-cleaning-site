import { SquareClient, SquareEnvironment } from 'square';

export async function GET(request) {
  try {
    console.log('Testing Square credentials...');
    console.log('Has token:', !!process.env.SQUARE_ACCESS_TOKEN);
    console.log('Token length:', process.env.SQUARE_ACCESS_TOKEN?.length);
    console.log('Token first 10 chars:', process.env.SQUARE_ACCESS_TOKEN?.substring(0, 10));
    console.log('Environment:', process.env.SQUARE_ENVIRONMENT);
    console.log('Location ID:', process.env.SQUARE_LOCATION_ID);

    // Create Square client with fresh environment variables
    const client = new SquareClient({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
    });

    // Try a simple API call to test the token
    const locationsResponse = await client.locations.list();

    console.log('Success! Locations:', locationsResponse.result);

    return Response.json({
      success: true,
      message: 'Square credentials are valid!',
      locations: locationsResponse.result.locations?.map(loc => ({
        id: loc.id,
        name: loc.name,
        status: loc.status
      }))
    });

  } catch (error) {
    console.error('Square test failed:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors
    });

    return Response.json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      details: error.errors
    }, { status: error.statusCode || 500 });
  }
}
