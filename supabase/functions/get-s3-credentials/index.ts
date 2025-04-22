// supabase/functions/get-s3-credentials/index.ts
import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the service role key
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get the JWT from the request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'No authorization header' }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            )
        }

        const token = authHeader.replace('Bearer ', '')

        // Verify the JWT token
        const { data: { user }, error: verifyError } = await supabase.auth.getUser(token)

        if (verifyError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid token' }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                }
            )
        }

        // Generate temporary S3 credentials
        // This would typically call AWS STS or your S3 service
        const credentials = {
            accessKeyId: 'your-temporary-access-key-id',
            secretAccessKey: 'your-temporary-secret-access-key',
            sessionToken: 'your-temporary-session-token',
            expiration: new Date(Date.now() + 3600 * 1000) // 1 hour
        }

        return new Response(
            JSON.stringify(credentials),
            {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            }
        )
    }
})