import { Fragment, Message } from "@prisma/client";

export interface MessageWithFragment extends Message {
  fragment: Fragment | null;
}

export interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export interface BaseProjectProps {
  projectId: string;
}

export interface FragmentViewProps extends BaseProjectProps {
  fragment: Fragment | null;
  onFragmentChange: (fragment: Fragment | null) => void;
}

export interface FileCollection {
  [path: string]: string;
}
