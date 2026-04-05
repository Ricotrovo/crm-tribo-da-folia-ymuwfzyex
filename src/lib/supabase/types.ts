// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          base_value: number
          client_id: string | null
          contract_number: number | null
          created_at: string
          discount: number
          event_id: string | null
          extra_guests_value: number
          id: string
          installments: number | null
          notes: string | null
          optionals_value: number
          payment_method: string | null
          status: string | null
          total_value: number
          updated_at: string
        }
        Insert: {
          base_value?: number
          client_id?: string | null
          contract_number?: number | null
          created_at?: string
          discount?: number
          event_id?: string | null
          extra_guests_value?: number
          id?: string
          installments?: number | null
          notes?: string | null
          optionals_value?: number
          payment_method?: string | null
          status?: string | null
          total_value?: number
          updated_at?: string
        }
        Update: {
          base_value?: number
          client_id?: string | null
          contract_number?: number | null
          created_at?: string
          discount?: number
          event_id?: string | null
          extra_guests_value?: number
          id?: string
          installments?: number | null
          notes?: string | null
          optionals_value?: number
          payment_method?: string | null
          status?: string | null
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contracts_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contracts_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          message: string
          sender: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          message: string
          sender: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          message?: string
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversations_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      events: {
        Row: {
          client_name: string
          created_at: string
          date: string
          guests: number | null
          id: string
          menu: string | null
          salon: string
          status: string | null
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          date: string
          guests?: number | null
          id?: string
          menu?: string | null
          salon: string
          status?: string | null
          time: string
          title: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          date?: string
          guests?: number | null
          id?: string
          menu?: string | null
          salon?: string
          status?: string | null
          time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          id: string
          name: string
          origin: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          origin?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          origin?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          due_date: string
          id: string
          installment_number: number
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          min_quantity: number
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          min_quantity?: number
          name: string
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          min_quantity?: number
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock: {
        Row: {
          created_at: string
          id: string
          location: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stock_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          location_from: string | null
          location_to: string | null
          lot: string | null
          product_id: string
          quantity: number
          type: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          location_from?: string | null
          location_to?: string | null
          lot?: string | null
          product_id: string
          quantity: number
          type: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          location_from?: string | null
          location_to?: string | null
          lot?: string | null
          product_id?: string
          quantity?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stock_movements_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stock_movements_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
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
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   phone: text (nullable)
//   email: text (nullable)
//   document: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: contracts
//   id: uuid (not null, default: gen_random_uuid())
//   contract_number: integer (nullable, default: nextval('contract_number_seq'::regclass))
//   client_id: uuid (nullable)
//   event_id: uuid (nullable)
//   status: text (nullable, default: 'Draft'::text)
//   base_value: numeric (not null, default: 0)
//   extra_guests_value: numeric (not null, default: 0)
//   optionals_value: numeric (not null, default: 0)
//   discount: numeric (not null, default: 0)
//   total_value: numeric (not null, default: 0)
//   installments: integer (nullable, default: 1)
//   payment_method: text (nullable)
//   notes: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: conversations
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   sender: text (not null)
//   message: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: events
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   date: date (not null)
//   time: text (not null)
//   salon: text (not null)
//   client_name: text (not null)
//   guests: integer (nullable, default: 0)
//   menu: text (nullable)
//   status: text (nullable, default: 'Pending'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   phone: text (nullable)
//   origin: text (nullable, default: 'WhatsApp'::text)
//   status: text (nullable, default: 'Novo'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: payments
//   id: uuid (not null, default: gen_random_uuid())
//   contract_id: uuid (nullable)
//   amount: numeric (not null)
//   due_date: date (not null)
//   status: text (nullable, default: 'Pending'::text)
//   installment_number: integer (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   unit: text (not null)
//   min_quantity: numeric (not null, default: 0)
//   category: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: stock
//   id: uuid (not null, default: gen_random_uuid())
//   product_id: uuid (not null)
//   location: text (not null)
//   quantity: numeric (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: stock_movements
//   id: uuid (not null, default: gen_random_uuid())
//   product_id: uuid (not null)
//   type: text (not null)
//   quantity: numeric (not null)
//   location_from: text (nullable)
//   location_to: text (nullable)
//   event_id: uuid (nullable)
//   lot: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
// Table: contracts
//   FOREIGN KEY contracts_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
//   FOREIGN KEY contracts_event_id_fkey: FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT
//   PRIMARY KEY contracts_pkey: PRIMARY KEY (id)
// Table: conversations
//   FOREIGN KEY conversations_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY conversations_pkey: PRIMARY KEY (id)
// Table: events
//   PRIMARY KEY events_pkey: PRIMARY KEY (id)
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
// Table: payments
//   FOREIGN KEY payments_contract_id_fkey: FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
//   PRIMARY KEY payments_pkey: PRIMARY KEY (id)
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
// Table: stock
//   CHECK stock_location_check: CHECK ((location = ANY (ARRAY['camara'::text, 'freezer'::text])))
//   PRIMARY KEY stock_pkey: PRIMARY KEY (id)
//   FOREIGN KEY stock_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
//   UNIQUE stock_product_id_location_key: UNIQUE (product_id, location)
// Table: stock_movements
//   FOREIGN KEY stock_movements_event_id_fkey: FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
//   CHECK stock_movements_location_from_check: CHECK ((location_from = ANY (ARRAY['camara'::text, 'freezer'::text])))
//   CHECK stock_movements_location_to_check: CHECK ((location_to = ANY (ARRAY['camara'::text, 'freezer'::text])))
//   PRIMARY KEY stock_movements_pkey: PRIMARY KEY (id)
//   FOREIGN KEY stock_movements_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
//   CHECK stock_movements_type_check: CHECK ((type = ANY (ARRAY['entry'::text, 'exit'::text, 'transfer'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: clients
//   Policy "authenticated_all_clients" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: contracts
//   Policy "authenticated_all_contracts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: conversations
//   Policy "authenticated_all_conversations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: events
//   Policy "authenticated_delete_events" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_events" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_events" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_events" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: leads
//   Policy "authenticated_all_leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: payments
//   Policy "authenticated_all_payments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: products
//   Policy "authenticated_all_products" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: stock
//   Policy "authenticated_all_stock" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: stock_movements
//   Policy "authenticated_all_stock_movements" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_stock_movement()
//   CREATE OR REPLACE FUNCTION public.handle_stock_movement()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.type = 'entry' THEN
//       INSERT INTO public.stock (product_id, location, quantity)
//       VALUES (NEW.product_id, NEW.location_to, NEW.quantity)
//       ON CONFLICT (product_id, location) DO UPDATE
//       SET quantity = public.stock.quantity + NEW.quantity, updated_at = NOW();
//     ELSIF NEW.type = 'exit' THEN
//       INSERT INTO public.stock (product_id, location, quantity)
//       VALUES (NEW.product_id, NEW.location_from, -NEW.quantity)
//       ON CONFLICT (product_id, location) DO UPDATE
//       SET quantity = public.stock.quantity - NEW.quantity, updated_at = NOW();
//     ELSIF NEW.type = 'transfer' THEN
//       INSERT INTO public.stock (product_id, location, quantity)
//       VALUES (NEW.product_id, NEW.location_from, -NEW.quantity)
//       ON CONFLICT (product_id, location) DO UPDATE
//       SET quantity = public.stock.quantity - NEW.quantity, updated_at = NOW();
//
//       INSERT INTO public.stock (product_id, location, quantity)
//       VALUES (NEW.product_id, NEW.location_to, NEW.quantity)
//       ON CONFLICT (product_id, location) DO UPDATE
//       SET quantity = public.stock.quantity + NEW.quantity, updated_at = NOW();
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION update_modified_column()
//   CREATE OR REPLACE FUNCTION public.update_modified_column()
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
// Table: leads
//   update_leads_modtime: CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_modified_column()
// Table: stock_movements
//   on_stock_movement: CREATE TRIGGER on_stock_movement AFTER INSERT ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION handle_stock_movement()

// --- INDEXES ---
// Table: stock
//   CREATE UNIQUE INDEX stock_product_id_location_key ON public.stock USING btree (product_id, location)
