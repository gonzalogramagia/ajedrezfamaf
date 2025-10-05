const { createClient } = require('@supabase/supabase-js')
const multipart = require('parse-multipart-data')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase configuration missing')
}

// Cliente con service role para operaciones administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

exports.handler = async (event, context) => {
  console.log('Upload request received')
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // Parse multipart form data
    const boundary = event.headers['content-type']?.split('boundary=')[1]
    if (!boundary) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'No boundary found in content-type' })
      }
    }

    const parts = multipart.parse(Buffer.from(event.body, 'base64'), boundary)
    const filePart = parts.find(part => part.name === 'image')
    
    if (!filePart) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'No image file found' })
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = filePart.filename || 'image'
    const extension = originalName.split('.').pop() || 'jpg'
    const fileName = `featured-${timestamp}.${extension}`
    
    console.log('Uploading file:', fileName)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('post-images')
      .upload(fileName, filePart.data, {
        contentType: filePart.type || 'image/jpeg',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: error.message })
      }
    }

    console.log('Upload successful:', data)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        fileName: data.path,
        url: `${supabaseUrl}/storage/v1/object/public/post-images/${data.path}`
      })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
