import ModpackCard from '@/components/modpack-card';
import { getUserModpacks } from '@/lib/api';
import store from '@/store/store';
import type { Modpack } from '@/types/modpack';
import { queryOptions } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react';

export const Route = createFileRoute("/")({
  loader: async ({
    context: { queryClient, user }
  }) => {
    
    if(!user) {
      return {user, queryClient, modpacks: null}
    }

    const modpacks = await queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["modpacks"],
        queryFn: () => getUserModpacks(user)
      })
    );

    return {user, modpacks};
  },
  component: Home,
});

function Home() {
    const { addBreadCrumb } = store();
    const {modpacks} = Route.useLoaderData();

    return <section className="flex flex-col justify-between items-center w-full mx-auto h-full">
        <div className="flex flex-row justify-around items-center mb-10">
            <h1 className="text-3xl font-bold p-2">Modpacks</h1>
            <Link to="/" onClick={() => addBreadCrumb({text:"Create modpack", link: "/create_modpack"})} className="bg-blue-400 rounded font-bold text-4xl hover:bg-blue-300 cursor-pointer"><Plus /></Link>
        </div>
        <div id="modpacks" className="flex flex-row flex-wrap gap-4 min-w-full justify-center items-center">
            {modpacks ? modpacks.map((modpack: Modpack, index: number) => {
              return <ModpackCard modpack={modpack} key={index}/>
            }) : <h1>Log in to create modpacks!</h1>}
        </div>
    </section>
}
