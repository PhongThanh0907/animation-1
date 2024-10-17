import dynamic from "next/dynamic";

const DynamicThreeHero = dynamic(async () => import("@/components/ThreeHero"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative z-10 h-screen w-full">
      <DynamicThreeHero />
    </div>
  );
}
