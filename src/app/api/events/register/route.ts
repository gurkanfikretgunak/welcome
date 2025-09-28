import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/events/register - Register for an event (public)
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Registering for event')
    
    const body = await request.json()
    const { 
      event_id, 
      full_name, 
      email, 
      title, 
      company, 
      gdpr_consent,
      recaptcha_token 
    } = body

    // Validate required fields
    if (!event_id || !full_name || !email || !gdpr_consent) {
      return NextResponse.json({ 
        error: 'Event ID, full name, email, and GDPR consent are required' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Verify reCAPTCHA token
    if (recaptcha_token) {
      const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
      if (recaptchaSecret) {
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${recaptchaSecret}&response=${recaptcha_token}`
        })

        const recaptchaData = await recaptchaResponse.json()
        if (!recaptchaData.success) {
          return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
        }
      }
    }

    // Register for event using the database function
    const { data, error } = await supabase.rpc('register_for_event', {
      p_event_id: event_id,
      p_full_name: full_name,
      p_email: email,
      p_title: title || null,
      p_company: company || null,
      p_gdpr_consent: gdpr_consent
    })

    if (error) {
      console.error('❌ Register for event error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const registrationData = Array.isArray(data) ? data[0] : data

    console.log('✅ Event registration successful:', registrationData?.reference_number)
    return NextResponse.json({ 
      registration: registrationData,
      success: true 
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Register for event exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
