import Image from "next/image";
import MessageInput from "./_components/message-input";
import ProjectList from "./_components/project-list";

export default function HomePage() {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full px-4 py-6">
      <section className="space-y-6 flex flex-col h-[calc(100vh-1px)] justify-center items-center">
        <div className="flex flex-col items-center">
          <Image
            src={"/unlovable-logo.png"}
            alt="Logo"
            width={50}
            height={50}
            // className="hidden md:block"
          />
        </div>

        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build something with Unlovable
        </h1>
        <p className="text-lg max-w-[280px] md:max-w-sm md:text-xl text-muted-foreground text-center">
          Create app and website by chatting with AI
        </p>

        <div className="max-w-3xl mx-auto w-full">
          <MessageInput />
        </div>
      </section>

      {/* Project List */}
      <section className="bg-sidebar rounded-xl p-8 border">
        <ProjectList />
      </section>
    </div>
  );
}
