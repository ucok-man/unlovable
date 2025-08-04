type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage(props: Props) {
  const params = await props.params;

  return <div>ProjectDetailPage {params.projectId}</div>;
}
