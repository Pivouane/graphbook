export interface ModuleSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  user: {
    id: string;
    name: string;
  };
}

export interface ModuleUser {
  id: string;
  name: string;
  username: string | null;
  imageURL: string | null;
  quote: string | null;
  promo: string | null;
  activeModules: ModulePayload[];
  favoriteIDs: string[];
}

export interface ModulePayload {
  slug: string;
  args: Record<string, unknown> | null;
}

export type ModuleComponentProps = {
  context: ModuleContext;
  manifest: ModuleManifest;
};

export interface ModuleContext {
  profileUser: ModuleUser;
  currentSession: ModuleSession;
}

export interface ModuleManifest {
  slug: string;
  name: string;
  description: string;
  default: boolean;
  order: number;
}
