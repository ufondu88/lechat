import { createClient } from "@supabase/supabase-js";
import { BaseController } from "./base.controller";

export class BaseSupabaseService extends BaseController {    
  SUPABASE_URL = process.env.SUPABASE_URL
  SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
  SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
  supabaseAuth = this.createClient(this.SUPABASE_URL, this.SUPABASE_SERVICE_KEY)
  supabaseStorage = this.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY)

  constructor(context: string) {
    super(context)
  }

  createClient(supabaseUrl: string, supabaseKey: string) {
    return createClient(supabaseUrl, supabaseKey)
  }
}