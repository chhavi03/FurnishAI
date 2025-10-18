import { BRAND } from "../config/brand";
import { SectionTitle, SubTitle, ShellCard } from "../components/ui";

export default function About() {
  return (
    <div className="space-y-8">
      <SectionTitle>About {BRAND.name}</SectionTitle>
      <SubTitle>Revolutionizing furniture discovery through artificial intelligence.</SubTitle>

      <div className="grid md:grid-cols-2 gap-6">
        <ShellCard title="Our Mission">
          <p className="text-slate-600 dark:text-slate-300">
            We’re on a mission to make furniture shopping intuitive, personalized, and enjoyable.
            By leveraging cutting-edge AI for text, images, and vector search, {BRAND.short} suggests pieces that match your taste and budget.
          </p>
        </ShellCard>

        <ShellCard title="AI-Powered Technology">
          <p className="text-slate-600 dark:text-slate-300">
            We use modern embeddings, NLP, and computer vision to understand products and your prompts.
            The system also generates creative product descriptions to help you decide faster.
          </p>
        </ShellCard>

        <ShellCard title="Data-Driven Insights">
          <p className="text-slate-600 dark:text-slate-300">
            Our analytics dashboard highlights category trends, price bands, and brand performance so teams can plan smarter assortments.
          </p>
        </ShellCard>

        <ShellCard title="Privacy & Control">
          <p className="text-slate-600 dark:text-slate-300">
            You’re in control: search data isn’t shared; generated content is opt-in to save.
          </p>
        </ShellCard>
      </div>
    </div>
  );
}
