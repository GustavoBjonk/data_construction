/**
 * PROVISÓRIO — escrito à mão a partir de supabase/migrations, no formato do
 * `supabase gen types typescript`. Depois de aplicar as migrações no projeto,
 * rode `npm run db:types` para substituir este arquivo pelos tipos gerados.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type AppRole = "user" | "moderator" | "editor" | "admin" | "superadmin";
type AccountStatus = "active" | "suspended";
type ContentStatus = "draft" | "review" | "scheduled" | "published" | "archived";
type VerificationStatus = "unverified" | "verified" | "flagged";

/** Colunas preenchidas pelo servidor (gatilhos) — opcionais na escrita. */
type Audited = {
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

type Editorial = Audited & {
  status: ContentStatus;
  scheduled_for: string | null;
};

type Table<Row, Required extends keyof Row, Relationships extends unknown[] = []> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Row>;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          display_name: string;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          interests: string[];
          created_at: string;
          updated_at: string;
        },
        "id" | "display_name"
      >;
      user_roles: Table<
        { user_id: string; role: AppRole; status: AccountStatus; updated_at: string; updated_by: string | null },
        "user_id"
      >;
      audit_log: Table<
        {
          id: number;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json;
          created_at: string;
        },
        "action" | "entity_type"
      >;
      articles: Table<
        {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: string;
          body: string[];
          citations: Json;
          author_name: string;
          author_bio: string;
          reading_time_minutes: number;
          published_on: string | null;
          seo_title: string | null;
          seo_description: string | null;
          featured: boolean;
        } & Editorial,
        "id" | "slug" | "title" | "category" | "author_name" | "reading_time_minutes"
      >;
      news: Table<
        {
          id: string;
          slug: string;
          title: string;
          summary: string;
          relevance: string;
          published_on: string;
          collected_at: string;
          verified_on: string | null;
          verification: VerificationStatus;
          verification_notes: string | null;
          categories: string[];
          tags: string[];
          source_name: string;
          source_url: string;
          image_url: string | null;
          featured: boolean;
          related: Json;
        } & Editorial,
        "id" | "slug" | "title" | "summary" | "published_on" | "categories" | "source_name" | "source_url"
      >;
      datasets: Table<
        {
          id: string;
          name: string;
          description: string;
          category: string;
          difficulty: string;
          size_label: string | null;
          format: string | null;
          topics: string[];
          technologies: string[];
          ideal_for: string[];
          source_name: string;
          source_url: string;
          featured: boolean;
          sort_order: number;
        } & Editorial,
        "id" | "name" | "description" | "category" | "difficulty" | "source_name" | "source_url"
      >;
      courses: Table<
        {
          id: string;
          title: string;
          platform: string;
          area: string;
          course_type: string;
          price: number | null;
          currency: string;
          price_checked_on: string | null;
          duration: string | null;
          level: string;
          description: string;
          skills: string[];
          url: string;
          is_sponsored: boolean;
          sort_order: number;
        } & Editorial,
        "id" | "title" | "platform" | "area" | "course_type" | "level" | "description" | "url"
      >;
      roadmaps: Table<
        {
          id: string;
          slug: string;
          title: string;
          description: string;
          level: string;
          estimated_duration: string;
          project_area: string | null;
          sort_order: number;
        } & Editorial,
        "id" | "slug" | "title" | "description" | "level" | "estimated_duration"
      >;
      roadmap_steps: Table<
        {
          id: string;
          roadmap_id: string;
          position: number;
          title: string;
          description: string;
          topics: string[];
          technologies: string[];
          created_at: string;
          updated_at: string;
        },
        "id" | "roadmap_id" | "position" | "title" | "description",
        [
          {
            foreignKeyName: "roadmap_steps_roadmap_id_fkey";
            columns: ["roadmap_id"];
            isOneToOne: false;
            referencedRelation: "roadmaps";
            referencedColumns: ["id"];
          },
        ]
      >;
      roadmap_step_courses: Table<
        { step_id: string; course_id: string; position: number },
        "step_id" | "course_id",
        [
          {
            foreignKeyName: "roadmap_step_courses_step_id_fkey";
            columns: ["step_id"];
            isOneToOne: false;
            referencedRelation: "roadmap_steps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roadmap_step_courses_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ]
      >;
      projects: Table<
        {
          id: string;
          title: string;
          description: string;
          area: string;
          difficulty: string;
          technologies: string[];
          skills: string[];
          estimated_time: string;
          objective: string;
          repository_url: string | null;
          demo_url: string | null;
          featured: boolean;
          sort_order: number;
        } & Editorial,
        "id" | "title" | "description" | "area" | "difficulty" | "estimated_time" | "objective"
      >;
      organizations: Table<
        {
          id: string;
          name: string;
          description: string;
          category: string;
          official_site_url: string;
          donation_url: string;
          sort_order: number;
        } & Editorial,
        "id" | "name" | "description" | "category" | "official_site_url" | "donation_url"
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      set_user_role: { Args: { target_user: string; new_role: AppRole }; Returns: undefined };
      set_user_status: { Args: { target_user: string; new_status: AccountStatus }; Returns: undefined };
    };
    Enums: {
      app_role: AppRole;
      account_status: AccountStatus;
      content_status: ContentStatus;
      verification_status: VerificationStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
