import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { user_id, file_path } = await req.json()
    console.log('📦 Received payload:', { user_id, file_path })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get all avatar files under this user ID folder
    const { data: objects, error: listError } = await supabase
      .storage
      .from('avatars')
      .list(user_id, { limit: 100 })

    if (listError) {
      console.error('❌ Failed to list avatars:', listError)
      return new Response(JSON.stringify({ error: 'Failed to list avatars' }), { status: 500 })
    }

    // Delete all files in the user_id folder EXCEPT the current file
    const filesToDelete = objects
      .filter(obj => `${user_id}/${obj.name}` !== file_path)
      .map(obj => `${user_id}/${obj.name}`)

    if (filesToDelete.length > 0) {
      console.log(`🧹 Deleting ${filesToDelete.length} old avatar(s)...`)
      const { error: deleteError } = await supabase
        .storage
        .from('avatars')
        .remove(filesToDelete)

      if (deleteError) {
        console.error('⚠️ Failed to delete old avatars:', deleteError)
      } else {
        console.log('✅ Old avatars deleted')
      }
    }

    // Set owner on the new file via the REST API
    const restResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/objects`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}`,
      },
      body: JSON.stringify({
        owner: user_id,
      }),
    })

    if (!restResponse.ok) {
      const errorText = await restResponse.text()
      console.error('❌ Failed to set owner via REST API:', errorText)
      return new Response(JSON.stringify({ error: 'Failed to set owner', details: errorText }), {
        status: restResponse.status,
      })
    }

    console.log('🎉 Owner successfully set on avatar object')
    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (e) {
    console.error('💥 Unexpected error:', e)
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
