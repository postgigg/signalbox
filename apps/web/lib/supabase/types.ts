export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          plan: 'free' | 'trial' | 'starter' | 'pro' | 'agency';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status:
            | 'trialing'
            | 'active'
            | 'past_due'
            | 'canceled'
            | 'unpaid';
          trial_ends_at: string | null;
          hot_lead_threshold: number;
          warm_lead_threshold: number;
          timezone: string;
          notification_email: string | null;
          webhook_secret: string | null;
          branding_removed: boolean;
          is_suspended: boolean;
          suspended_reason: string | null;
          suspended_at: string | null;
          deleted_at: string | null;
          slack_webhook_url: string | null;
          internal_notes: string | null;
          is_featured: boolean | null;
          referral_source: string | null;
          lifetime_revenue: number | null;
          scoring_config: Json;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          plan?: 'free' | 'trial' | 'starter' | 'pro' | 'agency';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?:
            | 'trialing'
            | 'active'
            | 'past_due'
            | 'canceled'
            | 'unpaid';
          trial_ends_at?: string | null;
          hot_lead_threshold?: number;
          warm_lead_threshold?: number;
          timezone?: string;
          notification_email?: string | null;
          webhook_secret?: string | null;
          branding_removed?: boolean;
          slack_webhook_url?: string | null;
          is_suspended?: boolean;
          suspended_reason?: string | null;
          suspended_at?: string | null;
          deleted_at?: string | null;
          internal_notes?: string | null;
          is_featured?: boolean | null;
          referral_source?: string | null;
          lifetime_revenue?: number | null;
          scoring_config?: Json;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          plan?: 'free' | 'trial' | 'starter' | 'pro' | 'agency';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?:
            | 'trialing'
            | 'active'
            | 'past_due'
            | 'canceled'
            | 'unpaid';
          trial_ends_at?: string | null;
          hot_lead_threshold?: number;
          warm_lead_threshold?: number;
          timezone?: string;
          notification_email?: string | null;
          webhook_secret?: string | null;
          branding_removed?: boolean;
          slack_webhook_url?: string | null;
          is_suspended?: boolean;
          suspended_reason?: string | null;
          suspended_at?: string | null;
          deleted_at?: string | null;
          internal_notes?: string | null;
          is_featured?: boolean | null;
          referral_source?: string | null;
          lifetime_revenue?: number | null;
          scoring_config?: Json;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          account_id: string;
          user_id: string | null;
          role: 'owner' | 'admin' | 'viewer';
          invited_email: string | null;
          invited_at: string | null;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          user_id?: string | null;
          role?: 'owner' | 'admin' | 'viewer';
          invited_email?: string | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          user_id?: string | null;
          role?: 'owner' | 'admin' | 'viewer';
          invited_email?: string | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      widgets: {
        Row: {
          id: string;
          account_id: string;
          widget_key: string;
          name: string;
          domain: string | null;
          is_active: boolean;
          theme: Json;
          confirmation: Json;
          social_proof_text: string | null;
          social_proof_min: number | null;
          contact_show_phone: boolean | null;
          contact_phone_required: boolean | null;
          contact_show_message: boolean | null;
          contact_message_required: boolean | null;
          contact_message_placeholder: string | null;
          contact_submit_text: string | null;
          submission_count: number;
          submission_limit: number;
          client_account_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          widget_key?: string;
          name?: string;
          domain?: string | null;
          is_active?: boolean;
          theme?: Json;
          confirmation?: Json;
          social_proof_text?: string | null;
          social_proof_min?: number | null;
          contact_show_phone?: boolean | null;
          contact_phone_required?: boolean | null;
          contact_show_message?: boolean | null;
          contact_message_required?: boolean | null;
          contact_message_placeholder?: string | null;
          contact_submit_text?: string | null;
          submission_count?: number;
          submission_limit?: number;
          client_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          widget_key?: string;
          name?: string;
          domain?: string | null;
          is_active?: boolean;
          theme?: Json;
          confirmation?: Json;
          social_proof_text?: string | null;
          social_proof_min?: number | null;
          contact_show_phone?: boolean | null;
          contact_phone_required?: boolean | null;
          contact_show_message?: boolean | null;
          contact_message_required?: boolean | null;
          contact_message_placeholder?: string | null;
          contact_submit_text?: string | null;
          submission_count?: number;
          submission_limit?: number;
          client_account_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      flows: {
        Row: {
          id: string;
          widget_id: string;
          version: number;
          is_active: boolean;
          steps: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          widget_id: string;
          version?: number;
          is_active?: boolean;
          steps: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          widget_id?: string;
          version?: number;
          is_active?: boolean;
          steps?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          id: string;
          widget_id: string;
          account_id: string;
          flow_version: number;
          visitor_name: string;
          visitor_email: string;
          visitor_phone: string | null;
          visitor_message: string | null;
          answers: Json;
          raw_score: number;
          lead_score: number;
          lead_tier: 'hot' | 'warm' | 'cold';
          form_score: number;
          behavioral_score: number;
          intent_score: number;
          decay_penalty: number;
          score_dimensions: Json;
          last_engagement_at: string;
          visitor_fingerprint: string | null;
          routing_strategy: string | null;
          source_url: string | null;
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          country: string | null;
          device_type: 'desktop' | 'mobile' | 'tablet' | null;
          status:
            | 'new'
            | 'viewed'
            | 'contacted'
            | 'qualified'
            | 'disqualified'
            | 'converted'
            | 'archived';
          viewed_at: string | null;
          contacted_at: string | null;
          notes: string | null;
          tags: string[];
          notification_sent: boolean;
          notification_sent_at: string | null;
          assigned_to: string | null;
          assigned_at: string | null;
          assigned_by_rule_id: string | null;
          ab_test_id: string | null;
          ab_variant: 'a' | 'b' | null;
          gated: boolean;
          followup_sent: boolean;
          followup_sent_at: string | null;
          linked_submission_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          widget_id: string;
          account_id: string;
          flow_version: number;
          visitor_name: string;
          visitor_email: string;
          visitor_phone?: string | null;
          visitor_message?: string | null;
          answers: Json;
          raw_score: number;
          lead_score: number;
          lead_tier: 'hot' | 'warm' | 'cold';
          form_score: number;
          behavioral_score?: number;
          intent_score?: number;
          decay_penalty?: number;
          score_dimensions?: Json;
          last_engagement_at?: string;
          visitor_fingerprint?: string | null;
          routing_strategy?: string | null;
          source_url?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          country?: string | null;
          device_type?: 'desktop' | 'mobile' | 'tablet' | null;
          status?:
            | 'new'
            | 'viewed'
            | 'contacted'
            | 'qualified'
            | 'disqualified'
            | 'converted'
            | 'archived';
          viewed_at?: string | null;
          contacted_at?: string | null;
          notes?: string | null;
          tags?: string[];
          notification_sent?: boolean;
          notification_sent_at?: string | null;
          assigned_to?: string | null;
          assigned_at?: string | null;
          assigned_by_rule_id?: string | null;
          ab_test_id?: string | null;
          ab_variant?: 'a' | 'b' | null;
          gated?: boolean;
          followup_sent?: boolean;
          followup_sent_at?: string | null;
          linked_submission_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          widget_id?: string;
          account_id?: string;
          flow_version?: number;
          visitor_name?: string;
          visitor_email?: string;
          visitor_phone?: string | null;
          visitor_message?: string | null;
          answers?: Json;
          raw_score?: number;
          lead_score?: number;
          lead_tier?: 'hot' | 'warm' | 'cold';
          form_score?: number;
          behavioral_score?: number;
          intent_score?: number;
          decay_penalty?: number;
          score_dimensions?: Json;
          last_engagement_at?: string;
          visitor_fingerprint?: string | null;
          routing_strategy?: string | null;
          source_url?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          country?: string | null;
          device_type?: 'desktop' | 'mobile' | 'tablet' | null;
          status?:
            | 'new'
            | 'viewed'
            | 'contacted'
            | 'qualified'
            | 'disqualified'
            | 'converted'
            | 'archived';
          viewed_at?: string | null;
          contacted_at?: string | null;
          notes?: string | null;
          tags?: string[];
          notification_sent?: boolean;
          notification_sent_at?: string | null;
          assigned_to?: string | null;
          assigned_at?: string | null;
          assigned_by_rule_id?: string | null;
          ab_test_id?: string | null;
          ab_variant?: 'a' | 'b' | null;
          gated?: boolean;
          followup_sent?: boolean;
          followup_sent_at?: string | null;
          linked_submission_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      api_keys: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          role: 'admin' | 'viewer';
          last_used_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          name?: string;
          key_hash: string;
          key_prefix: string;
          role?: 'admin' | 'viewer';
          last_used_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          role?: 'admin' | 'viewer';
          last_used_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      webhook_endpoints: {
        Row: {
          id: string;
          account_id: string;
          url: string;
          events: string[];
          is_active: boolean;
          secret: string;
          last_triggered_at: string | null;
          last_status_code: number | null;
          failure_count: number;
          next_retry_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          url: string;
          events?: string[];
          is_active?: boolean;
          secret: string;
          last_triggered_at?: string | null;
          last_status_code?: number | null;
          failure_count?: number;
          next_retry_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          url?: string;
          events?: string[];
          is_active?: boolean;
          secret?: string;
          last_triggered_at?: string | null;
          last_status_code?: number | null;
          failure_count?: number;
          next_retry_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      webhook_event_log: {
        Row: {
          id: string;
          account_id: string;
          webhook_endpoint_id: string;
          event: string;
          request_body: Json;
          response_status: number | null;
          response_body: string | null;
          duration_ms: number | null;
          success: boolean;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          webhook_endpoint_id: string;
          event: string;
          request_body: Json;
          response_status?: number | null;
          response_body?: string | null;
          duration_ms?: number | null;
          success?: boolean;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          webhook_endpoint_id?: string;
          event?: string;
          request_body?: Json;
          response_status?: number | null;
          response_body?: string | null;
          duration_ms?: number | null;
          success?: boolean;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      lead_routing_rules: {
        Row: {
          id: string;
          account_id: string;
          widget_id: string | null;
          name: string;
          priority: number;
          is_active: boolean;
          match_tier: 'hot' | 'warm' | 'cold' | null;
          match_step_id: string | null;
          match_option_id: string | null;
          assign_to_member_id: string | null;
          routing_strategy: 'direct' | 'skill' | 'geographic' | 'value' | 'round_robin' | 'availability';
          match_country: string[] | null;
          match_region: string[] | null;
          match_skill_tags: string[] | null;
          match_score_min: number | null;
          match_score_max: number | null;
          round_robin_pool: string[] | null;
          round_robin_weights: Json | null;
          fallback_strategy: 'none' | 'round_robin' | 'unassigned';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          widget_id?: string | null;
          name: string;
          priority?: number;
          is_active?: boolean;
          match_tier?: 'hot' | 'warm' | 'cold' | null;
          match_step_id?: string | null;
          match_option_id?: string | null;
          assign_to_member_id?: string | null;
          routing_strategy?: 'direct' | 'skill' | 'geographic' | 'value' | 'round_robin' | 'availability';
          match_country?: string[] | null;
          match_region?: string[] | null;
          match_skill_tags?: string[] | null;
          match_score_min?: number | null;
          match_score_max?: number | null;
          round_robin_pool?: string[] | null;
          round_robin_weights?: Json | null;
          fallback_strategy?: 'none' | 'round_robin' | 'unassigned';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          widget_id?: string | null;
          name?: string;
          priority?: number;
          is_active?: boolean;
          match_tier?: 'hot' | 'warm' | 'cold' | null;
          match_step_id?: string | null;
          match_option_id?: string | null;
          assign_to_member_id?: string | null;
          routing_strategy?: 'direct' | 'skill' | 'geographic' | 'value' | 'round_robin' | 'availability';
          match_country?: string[] | null;
          match_region?: string[] | null;
          match_skill_tags?: string[] | null;
          match_score_min?: number | null;
          match_score_max?: number | null;
          round_robin_pool?: string[] | null;
          round_robin_weights?: Json | null;
          fallback_strategy?: 'none' | 'round_robin' | 'unassigned';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shared_analytics_links: {
        Row: {
          id: string;
          account_id: string;
          client_account_id: string | null;
          widget_id: string | null;
          token: string;
          name: string;
          is_active: boolean;
          expires_at: string | null;
          password_hash: string | null;
          allowed_metrics: string[];
          last_accessed_at: string | null;
          access_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          client_account_id?: string | null;
          widget_id?: string | null;
          token: string;
          name: string;
          is_active?: boolean;
          expires_at?: string | null;
          password_hash?: string | null;
          allowed_metrics?: string[];
          last_accessed_at?: string | null;
          access_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          client_account_id?: string | null;
          widget_id?: string | null;
          token?: string;
          name?: string;
          is_active?: boolean;
          expires_at?: string | null;
          password_hash?: string | null;
          allowed_metrics?: string[];
          last_accessed_at?: string | null;
          access_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ab_tests: {
        Row: {
          id: string;
          widget_id: string;
          account_id: string;
          name: string;
          status: 'draft' | 'running' | 'paused' | 'completed';
          target_step_id: string;
          traffic_split: number;
          variant_b_question: string;
          variant_b_options: Json;
          winner: 'a' | 'b' | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          widget_id: string;
          account_id: string;
          name: string;
          status?: 'draft' | 'running' | 'paused' | 'completed';
          target_step_id: string;
          traffic_split?: number;
          variant_b_question: string;
          variant_b_options: Json;
          winner?: 'a' | 'b' | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          widget_id?: string;
          account_id?: string;
          name?: string;
          status?: 'draft' | 'running' | 'paused' | 'completed';
          target_step_id?: string;
          traffic_split?: number;
          variant_b_question?: string;
          variant_b_options?: Json;
          winner?: 'a' | 'b' | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ab_test_results: {
        Row: {
          id: string;
          ab_test_id: string;
          variant: 'a' | 'b';
          impressions: number;
          opens: number;
          completions: number;
          submissions: number;
          total_score: number;
          hot_count: number;
          warm_count: number;
          cold_count: number;
          date: string;
        };
        Insert: {
          id?: string;
          ab_test_id: string;
          variant: 'a' | 'b';
          impressions?: number;
          opens?: number;
          completions?: number;
          submissions?: number;
          total_score?: number;
          hot_count?: number;
          warm_count?: number;
          cold_count?: number;
          date?: string;
        };
        Update: {
          id?: string;
          ab_test_id?: string;
          variant?: 'a' | 'b';
          impressions?: number;
          opens?: number;
          completions?: number;
          submissions?: number;
          total_score?: number;
          hot_count?: number;
          warm_count?: number;
          cold_count?: number;
          date?: string;
        };
        Relationships: [];
      };
      flow_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          industry: string;
          steps: Json;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          industry: string;
          steps: Json;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          industry?: string;
          steps?: Json;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      inbound_emails: {
        Row: {
          id: string;
          message_id: string;
          from_email: string;
          from_name: string;
          to_email: string;
          subject: string;
          body_html: string | null;
          body_text: string | null;
          cc: string | null;
          bcc: string | null;
          reply_to: string | null;
          spam_status: string | null;
          is_read: boolean;
          is_archived: boolean;
          is_starred: boolean;
          received_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          from_email: string;
          from_name?: string;
          to_email: string;
          subject?: string;
          body_html?: string | null;
          body_text?: string | null;
          cc?: string | null;
          bcc?: string | null;
          reply_to?: string | null;
          spam_status?: string | null;
          is_read?: boolean;
          is_archived?: boolean;
          is_starred?: boolean;
          received_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          from_email?: string;
          from_name?: string;
          to_email?: string;
          subject?: string;
          body_html?: string | null;
          body_text?: string | null;
          cc?: string | null;
          bcc?: string | null;
          reply_to?: string | null;
          spam_status?: string | null;
          is_read?: boolean;
          is_archived?: boolean;
          is_starred?: boolean;
          received_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      widget_analytics: {
        Row: {
          id: string;
          widget_id: string;
          account_id: string;
          date: string;
          impressions: number;
          opens: number;
          step_1_views: number;
          step_2_views: number;
          step_3_views: number;
          step_4_views: number;
          step_5_views: number;
          step_1_abandons: number;
          step_2_abandons: number;
          step_3_abandons: number;
          step_4_abandons: number;
          step_5_abandons: number;
          completions: number;
          submissions: number;
          hot_count: number;
          warm_count: number;
          cold_count: number;
          avg_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          widget_id: string;
          account_id: string;
          date: string;
          impressions?: number;
          opens?: number;
          step_1_views?: number;
          step_2_views?: number;
          step_3_views?: number;
          step_4_views?: number;
          step_5_views?: number;
          step_1_abandons?: number;
          step_2_abandons?: number;
          step_3_abandons?: number;
          step_4_abandons?: number;
          step_5_abandons?: number;
          completions?: number;
          submissions?: number;
          hot_count?: number;
          warm_count?: number;
          cold_count?: number;
          avg_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          widget_id?: string;
          account_id?: string;
          date?: string;
          impressions?: number;
          opens?: number;
          step_1_views?: number;
          step_2_views?: number;
          step_3_views?: number;
          step_4_views?: number;
          step_5_views?: number;
          step_1_abandons?: number;
          step_2_abandons?: number;
          step_3_abandons?: number;
          step_4_abandons?: number;
          step_5_abandons?: number;
          completions?: number;
          submissions?: number;
          hot_count?: number;
          warm_count?: number;
          cold_count?: number;
          avg_score?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          account_id: string;
          member_id: string;
          email_on_hot_lead: boolean;
          email_on_warm_lead: boolean;
          email_on_cold_lead: boolean;
          email_hot_followup: boolean;
          email_weekly_digest: boolean;
          email_trial_alerts: boolean;
          email_billing_alerts: boolean;
          slack_on_hot_lead: boolean;
          slack_on_warm_lead: boolean;
          slack_on_cold_lead: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          member_id: string;
          email_on_hot_lead?: boolean;
          email_on_warm_lead?: boolean;
          email_on_cold_lead?: boolean;
          email_hot_followup?: boolean;
          email_weekly_digest?: boolean;
          email_trial_alerts?: boolean;
          email_billing_alerts?: boolean;
          slack_on_hot_lead?: boolean;
          slack_on_warm_lead?: boolean;
          slack_on_cold_lead?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          member_id?: string;
          email_on_hot_lead?: boolean;
          email_on_warm_lead?: boolean;
          email_on_cold_lead?: boolean;
          email_hot_followup?: boolean;
          email_weekly_digest?: boolean;
          email_trial_alerts?: boolean;
          email_billing_alerts?: boolean;
          slack_on_hot_lead?: boolean;
          slack_on_warm_lead?: boolean;
          slack_on_cold_lead?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      platform_metrics: {
        Row: {
          id: string;
          date: string;
          total_accounts: number;
          new_accounts: number;
          churned_accounts: number;
          trial_accounts: number;
          starter_accounts: number;
          pro_accounts: number;
          agency_accounts: number;
          total_submissions: number;
          mrr: number;
          new_mrr: number;
          churned_mrr: number;
          expansion_mrr: number;
          hot_submissions: number;
          warm_submissions: number;
          cold_submissions: number;
          total_active_widgets: number;
          total_impressions: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          total_accounts?: number;
          new_accounts?: number;
          churned_accounts?: number;
          trial_accounts?: number;
          starter_accounts?: number;
          pro_accounts?: number;
          agency_accounts?: number;
          total_submissions?: number;
          mrr?: number;
          new_mrr?: number;
          churned_mrr?: number;
          expansion_mrr?: number;
          hot_submissions?: number;
          warm_submissions?: number;
          cold_submissions?: number;
          total_active_widgets?: number;
          total_impressions?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total_accounts?: number;
          new_accounts?: number;
          churned_accounts?: number;
          trial_accounts?: number;
          starter_accounts?: number;
          pro_accounts?: number;
          agency_accounts?: number;
          total_submissions?: number;
          mrr?: number;
          new_mrr?: number;
          churned_mrr?: number;
          expansion_mrr?: number;
          hot_submissions?: number;
          warm_submissions?: number;
          cold_submissions?: number;
          total_active_widgets?: number;
          total_impressions?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      audits: {
        Row: {
          id: string;
          email: string;
          url: string;
          domain: string;
          scores: Json;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          url: string;
          domain: string;
          scores: Json;
          details: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          url?: string;
          domain?: string;
          scores?: Json;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_email: string;
          action: string;
          target_type: string;
          target_id: string;
          details: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_email: string;
          action: string;
          target_type: string;
          target_id: string;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_email?: string;
          action?: string;
          target_type?: string;
          target_id?: string;
          details?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_templates: {
        Row: {
          id: string;
          slug: string;
          subject: string;
          body_html: string;
          body_text: string | null;
          variables: string[];
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          subject: string;
          body_html: string;
          body_text?: string | null;
          variables?: string[];
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          subject?: string;
          body_html?: string;
          body_text?: string | null;
          variables?: string[];
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          account_id: string | null;
          requester_email: string;
          requester_name: string;
          subject: string;
          status: 'open' | 'pending' | 'resolved' | 'closed';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          category: 'billing' | 'technical' | 'general' | 'bug' | 'feature_request';
          assigned_to: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          requester_email: string;
          requester_name: string;
          subject: string;
          status?: 'open' | 'pending' | 'resolved' | 'closed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          category?: 'billing' | 'technical' | 'general' | 'bug' | 'feature_request';
          assigned_to?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string | null;
          requester_email?: string;
          requester_name?: string;
          subject?: string;
          status?: 'open' | 'pending' | 'resolved' | 'closed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          category?: 'billing' | 'technical' | 'general' | 'bug' | 'feature_request';
          assigned_to?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_accounts: {
        Row: {
          id: string;
          parent_account_id: string;
          name: string;
          slug: string;
          contact_name: string | null;
          contact_email: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_account_id: string;
          name: string;
          slug: string;
          contact_name?: string | null;
          contact_email?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_account_id?: string;
          name?: string;
          slug?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drip_sequences: {
        Row: {
          id: string;
          account_id: string;
          widget_id: string;
          name: string;
          target_tier: 'warm' | 'cold';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          widget_id: string;
          name: string;
          target_tier: 'warm' | 'cold';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          widget_id?: string;
          name?: string;
          target_tier?: 'warm' | 'cold';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drip_steps: {
        Row: {
          id: string;
          sequence_id: string;
          step_order: number;
          delay_hours: number;
          subject: string;
          body_html: string;
          body_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sequence_id: string;
          step_order: number;
          delay_hours: number;
          subject: string;
          body_html: string;
          body_text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sequence_id?: string;
          step_order?: number;
          delay_hours?: number;
          subject?: string;
          body_html?: string;
          body_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drip_enrollments: {
        Row: {
          id: string;
          sequence_id: string;
          submission_id: string;
          account_id: string;
          current_step: number;
          status: 'active' | 'completed' | 'paused' | 'cancelled';
          enrolled_at: string;
          last_sent_at: string | null;
          next_send_at: string | null;
          paused_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sequence_id: string;
          submission_id: string;
          account_id: string;
          current_step?: number;
          status?: 'active' | 'completed' | 'paused' | 'cancelled';
          enrolled_at?: string;
          last_sent_at?: string | null;
          next_send_at?: string | null;
          paused_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sequence_id?: string;
          submission_id?: string;
          account_id?: string;
          current_step?: number;
          status?: 'active' | 'completed' | 'paused' | 'cancelled';
          enrolled_at?: string;
          last_sent_at?: string | null;
          next_send_at?: string | null;
          paused_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      visitor_sessions: {
        Row: {
          id: string;
          widget_id: string;
          account_id: string;
          visitor_fingerprint: string;
          session_number: number;
          pages_viewed: number;
          page_urls: string[];
          time_on_site_seconds: number;
          max_scroll_depth: number;
          widget_opens: number;
          pricing_page_views: number;
          high_intent_page_views: number;
          started_at: string;
          submitted: boolean;
          submission_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          widget_id: string;
          account_id: string;
          visitor_fingerprint: string;
          session_number?: number;
          pages_viewed?: number;
          page_urls?: string[];
          time_on_site_seconds?: number;
          max_scroll_depth?: number;
          widget_opens?: number;
          pricing_page_views?: number;
          high_intent_page_views?: number;
          started_at?: string;
          submitted?: boolean;
          submission_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          widget_id?: string;
          account_id?: string;
          visitor_fingerprint?: string;
          session_number?: number;
          pages_viewed?: number;
          page_urls?: string[];
          time_on_site_seconds?: number;
          max_scroll_depth?: number;
          widget_opens?: number;
          pricing_page_views?: number;
          high_intent_page_views?: number;
          started_at?: string;
          submitted?: boolean;
          submission_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      score_history: {
        Row: {
          id: string;
          submission_id: string;
          account_id: string;
          previous_score: number;
          new_score: number;
          previous_tier: string;
          new_tier: string;
          change_reason: string;
          dimensions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          account_id: string;
          previous_score: number;
          new_score: number;
          previous_tier: string;
          new_tier: string;
          change_reason: string;
          dimensions?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          account_id?: string;
          previous_score?: number;
          new_score?: number;
          previous_tier?: string;
          new_tier?: string;
          change_reason?: string;
          dimensions?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      member_skills: {
        Row: {
          id: string;
          member_id: string;
          account_id: string;
          skill_tag: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          account_id: string;
          skill_tag: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          account_id?: string;
          skill_tag?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      member_territories: {
        Row: {
          id: string;
          member_id: string;
          account_id: string;
          country_code: string;
          region_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          account_id: string;
          country_code: string;
          region_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          account_id?: string;
          country_code?: string;
          region_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      member_availability: {
        Row: {
          member_id: string;
          account_id: string;
          status: 'online' | 'offline' | 'busy';
          status_updated_at: string;
          last_active_at: string;
          auto_offline_minutes: number;
          max_active_leads: number | null;
          timezone: string;
          schedule: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          member_id: string;
          account_id: string;
          status?: 'online' | 'offline' | 'busy';
          status_updated_at?: string;
          last_active_at?: string;
          auto_offline_minutes?: number;
          max_active_leads?: number | null;
          timezone?: string;
          schedule?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          member_id?: string;
          account_id?: string;
          status?: 'online' | 'offline' | 'busy';
          status_updated_at?: string;
          last_active_at?: string;
          auto_offline_minutes?: number;
          max_active_leads?: number | null;
          timezone?: string;
          schedule?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      round_robin_state: {
        Row: {
          rule_id: string;
          account_id: string;
          current_index: number;
          assignment_counts: Json;
          last_assigned_member_id: string | null;
          updated_at: string;
        };
        Insert: {
          rule_id: string;
          account_id: string;
          current_index?: number;
          assignment_counts?: Json;
          last_assigned_member_id?: string | null;
          updated_at?: string;
        };
        Update: {
          rule_id?: string;
          account_id?: string;
          current_index?: number;
          assignment_counts?: Json;
          last_assigned_member_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stripe_events: {
        Row: {
          event_id: string;
          event_type: string;
          processed_at: string;
        };
        Insert: {
          event_id: string;
          event_type: string;
          processed_at?: string;
        };
        Update: {
          event_id?: string;
          event_type?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
      wix_installations: {
        Row: {
          id: string;
          account_id: string;
          widget_id: string | null;
          wix_instance_id: string;
          wix_refresh_token: string;
          wix_access_token: string | null;
          wix_token_expires_at: string | null;
          wix_site_url: string | null;
          installed_at: string;
          uninstalled_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          widget_id?: string | null;
          wix_instance_id: string;
          wix_refresh_token: string;
          wix_access_token?: string | null;
          wix_token_expires_at?: string | null;
          wix_site_url?: string | null;
          installed_at?: string;
          uninstalled_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          widget_id?: string | null;
          wix_instance_id?: string;
          wix_refresh_token?: string;
          wix_access_token?: string | null;
          wix_token_expires_at?: string | null;
          wix_site_url?: string | null;
          installed_at?: string;
          uninstalled_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shopify_installations: {
        Row: {
          id: string;
          account_id: string;
          widget_id: string | null;
          shop_domain: string;
          access_token: string;
          script_tag_id: number | null;
          installed_at: string;
          uninstalled_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          widget_id?: string | null;
          shop_domain: string;
          access_token: string;
          script_tag_id?: number | null;
          installed_at?: string;
          uninstalled_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          widget_id?: string | null;
          shop_domain?: string;
          access_token?: string;
          script_tag_id?: number | null;
          installed_at?: string;
          uninstalled_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_type: 'customer' | 'admin';
          sender_email: string;
          body: string;
          is_internal_note: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_type: 'customer' | 'admin';
          sender_email: string;
          body: string;
          is_internal_note?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_type?: 'customer' | 'admin';
          sender_email?: string;
          body?: string;
          is_internal_note?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_submission_count: {
        Args: {
          widget_uuid: string;
          current_limit: number;
        };
        Returns: boolean;
      };
      advance_round_robin: {
        Args: {
          p_rule_id: string;
          p_pool: string[];
          p_max_leads: Json;
        };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience type helpers
type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row'];

export type InsertTables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];

// Shorthand aliases for common table types
export type Account = Tables<'accounts'>;
export type Member = Tables<'members'>;
export type Widget = Tables<'widgets'>;
export type Flow = Tables<'flows'>;
export type Submission = Tables<'submissions'>;
export type ApiKey = Tables<'api_keys'>;
export type WebhookEndpoint = Tables<'webhook_endpoints'>;
export type WebhookEventLog = Tables<'webhook_event_log'>;
export type LeadRoutingRule = Tables<'lead_routing_rules'>;
export type SharedAnalyticsLink = Tables<'shared_analytics_links'>;
export type AbTest = Tables<'ab_tests'>;
export type AbTestResult = Tables<'ab_test_results'>;
export type FlowTemplate = Tables<'flow_templates'>;
export type InboundEmail = Tables<'inbound_emails'>;
export type WidgetAnalytics = Tables<'widget_analytics'>;
export type NotificationPreference = Tables<'notification_preferences'>;
export type PlatformMetric = Tables<'platform_metrics'>;
export type AdminAuditLog = Tables<'admin_audit_log'>;
export type Audit = Tables<'audits'>;
export type PlatformSetting = Tables<'platform_settings'>;
export type EmailTemplate = Tables<'email_templates'>;
export type ClientAccount = Tables<'client_accounts'>;
export type SupportTicket = Tables<'support_tickets'>;
export type TicketMessage = Tables<'ticket_messages'>;
export type StripeEvent = Tables<'stripe_events'>;

// Predictive scoring and routing types
export type VisitorSession = Tables<'visitor_sessions'>;
export type ScoreHistory = Tables<'score_history'>;
export type MemberSkill = Tables<'member_skills'>;
export type MemberTerritory = Tables<'member_territories'>;
export type MemberAvailability = Tables<'member_availability'>;
export type RoundRobinState = Tables<'round_robin_state'>;

// Routing strategy type
export type RoutingStrategy = LeadRoutingRule['routing_strategy'];

// Availability status type
export type AvailabilityStatus = MemberAvailability['status'];

// Drip sequence types
export type DripSequence = Tables<'drip_sequences'>;
export type DripStep = Tables<'drip_steps'>;
export type DripEnrollment = Tables<'drip_enrollments'>;
export type DripEnrollmentStatus = DripEnrollment['status'];

// Plan type
export type Plan = Account['plan'];

// Subscription status type
export type SubscriptionStatus = Account['subscription_status'];

// Lead tier type
export type LeadTier = Submission['lead_tier'];

// Submission status type
export type SubmissionStatus = Submission['status'];

// Member role type
export type MemberRole = Member['role'];

// Device type
export type DeviceType = NonNullable<Submission['device_type']>;

// Support ticket types
export type TicketStatus = SupportTicket['status'];
export type TicketPriority = SupportTicket['priority'];
export type TicketCategory = SupportTicket['category'];
export type TicketSenderType = TicketMessage['sender_type'];

// A/B test status type
export type AbTestStatus = AbTest['status'];

// Wix integration types
export type WixInstallation = Tables<'wix_installations'>;

// Shopify integration types
export type ShopifyInstallation = Tables<'shopify_installations'>;
