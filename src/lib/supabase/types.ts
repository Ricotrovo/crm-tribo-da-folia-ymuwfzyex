// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          company_name: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          industry: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contract: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      event: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          profile_id: string | null
          salon: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          profile_id?: string | null
          salon?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          profile_id?: string | null
          salon?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      lead: {
        Row: {
          created_at: string | null
          id: string
          name: string
          profile_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          contact_id: string | null
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment: {
        Row: {
          amount: number | null
          contract_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          contract_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          contract_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contract"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          created_at: string | null
          id: string
          name: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          lead_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: clients
//   id: uuid (not null, default: uuid_generate_v4())
//   contact_id: uuid (nullable)
//   company_name: text (nullable)
//   industry: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: contacts
//   id: uuid (not null, default: uuid_generate_v4())
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: contract
//   id: uuid (not null, default: uuid_generate_v4())
//   client_id: uuid (nullable)
//   total_value: numeric (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: event
//   id: uuid (not null, default: uuid_generate_v4())
//   title: text (not null)
//   date: date (nullable)
//   salon: text (nullable)
//   profile_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: lead
//   id: uuid (not null, default: uuid_generate_v4())
//   name: text (not null)
//   status: text (nullable)
//   profile_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: leads
//   id: uuid (not null, default: uuid_generate_v4())
//   contact_id: uuid (nullable)
//   title: text (not null)
//   description: text (nullable)
//   status: text (nullable, default: 'new'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: payment
//   id: uuid (not null, default: uuid_generate_v4())
//   contract_id: uuid (nullable)
//   amount: numeric (nullable)
//   due_date: date (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: profile
//   id: uuid (not null, default: uuid_generate_v4())
//   name: text (not null)
//   role: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: proposals
//   id: uuid (not null, default: uuid_generate_v4())
//   lead_id: uuid (nullable)
//   client_id: uuid (nullable)
//   title: text (not null)
//   description: text (nullable)
//   value: numeric (nullable)
//   status: text (nullable, default: 'draft'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: clients
//   FOREIGN KEY clients_contact_id_fkey: FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
// Table: contacts
//   UNIQUE contacts_email_key: UNIQUE (email)
//   PRIMARY KEY contacts_pkey: PRIMARY KEY (id)
// Table: contract
//   FOREIGN KEY contract_client_id_fkey: FOREIGN KEY (client_id) REFERENCES profile(id) ON DELETE CASCADE
//   PRIMARY KEY contract_pkey: PRIMARY KEY (id)
// Table: event
//   PRIMARY KEY event_pkey: PRIMARY KEY (id)
//   FOREIGN KEY event_profile_id_fkey: FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
// Table: lead
//   PRIMARY KEY lead_pkey: PRIMARY KEY (id)
//   FOREIGN KEY lead_profile_id_fkey: FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
// Table: leads
//   FOREIGN KEY leads_contact_id_fkey: FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
// Table: payment
//   FOREIGN KEY payment_contract_id_fkey: FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE
//   PRIMARY KEY payment_pkey: PRIMARY KEY (id)
// Table: profile
//   PRIMARY KEY profile_pkey: PRIMARY KEY (id)
// Table: proposals
//   FOREIGN KEY proposals_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY proposals_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY proposals_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: clients
//   Policy "Users can delete their own clients" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = clients.contact_id)))
//   Policy "Users can insert their own clients" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = clients.contact_id)))
//   Policy "Users can update their own clients" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = clients.contact_id)))
//     WITH CHECK: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = clients.contact_id)))
//   Policy "Users can view their own clients" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = clients.contact_id)))
// Table: contacts
//   Policy "Users can delete their own contacts" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//   Policy "Users can insert their own contacts" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can update their own contacts" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can view their own contacts" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
// Table: contract
//   Policy "contract_policy" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT profile.id    FROM profile   WHERE (profile.id = contract.client_id)))
// Table: event
//   Policy "event_policy" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT profile.id    FROM profile   WHERE (profile.id = event.profile_id)))
// Table: lead
//   Policy "lead_policy" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT profile.id    FROM profile   WHERE (profile.id = lead.profile_id)))
// Table: leads
//   Policy "Users can delete their own leads" (DELETE, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = leads.contact_id)))
//   Policy "Users can insert their own leads" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = leads.contact_id)))
//   Policy "Users can update their own leads" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = leads.contact_id)))
//     WITH CHECK: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = leads.contact_id)))
//   Policy "Users can view their own leads" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT contacts.id    FROM contacts   WHERE (contacts.id = leads.contact_id)))
// Table: payment
//   Policy "payment_policy" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT profile.id    FROM profile   WHERE (profile.id IN ( SELECT contract.client_id            FROM contract           WHERE (contract.id = payment.contract_id)))))
// Table: profile
//   Policy "profile_policy" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
// Table: proposals
//   Policy "Users can delete their own proposals" (DELETE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() IN ( SELECT leads.contact_id    FROM leads   WHERE (leads.id = proposals.lead_id))) OR (auth.uid() IN ( SELECT clients.contact_id    FROM clients   WHERE (clients.id = proposals.client_id))))
//   Policy "Users can insert their own proposals" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: ((auth.uid() IN ( SELECT leads.contact_id    FROM leads   WHERE (leads.id = proposals.lead_id))) OR (auth.uid() IN ( SELECT clients.contact_id    FROM clients   WHERE (clients.id = proposals.client_id))))
//   Policy "Users can update their own proposals" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((auth.uid() IN ( SELECT leads.contact_id    FROM leads   WHERE (leads.id = proposals.lead_id))) OR (auth.uid() IN ( SELECT clients.contact_id    FROM clients   WHERE (clients.id = proposals.client_id))))
//     WITH CHECK: ((auth.uid() IN ( SELECT leads.contact_id    FROM leads   WHERE (leads.id = proposals.lead_id))) OR (auth.uid() IN ( SELECT clients.contact_id    FROM clients   WHERE (clients.id = proposals.client_id))))
//   Policy "Users can view their own proposals" (SELECT, PERMISSIVE) roles={public}
//     USING: ((auth.uid() IN ( SELECT leads.contact_id    FROM leads   WHERE (leads.id = proposals.lead_id))) OR (auth.uid() IN ( SELECT clients.contact_id    FROM clients   WHERE (clients.id = proposals.client_id))))

// --- DATABASE FUNCTIONS ---
// FUNCTION update_updated_at()
//   CREATE OR REPLACE FUNCTION public.update_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       NEW.updated_at = NOW();
//       RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: contract
//   contract_updated_at: CREATE TRIGGER contract_updated_at BEFORE UPDATE ON public.contract FOR EACH ROW EXECUTE FUNCTION update_updated_at()
// Table: event
//   event_updated_at: CREATE TRIGGER event_updated_at BEFORE UPDATE ON public.event FOR EACH ROW EXECUTE FUNCTION update_updated_at()
// Table: lead
//   lead_updated_at: CREATE TRIGGER lead_updated_at BEFORE UPDATE ON public.lead FOR EACH ROW EXECUTE FUNCTION update_updated_at()
// Table: payment
//   payment_updated_at: CREATE TRIGGER payment_updated_at BEFORE UPDATE ON public.payment FOR EACH ROW EXECUTE FUNCTION update_updated_at()
// Table: profile
//   profile_updated_at: CREATE TRIGGER profile_updated_at BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION update_updated_at()

// --- INDEXES ---
// Table: contacts
//   CREATE UNIQUE INDEX contacts_email_key ON public.contacts USING btree (email)

