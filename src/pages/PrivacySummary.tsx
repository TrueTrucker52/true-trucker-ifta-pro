import DataCollectionSummary from "@/components/DataCollectionSummary";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacySummary = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <DataCollectionSummary />
      </main>
      <Footer />
    </div>
  );
};

export default PrivacySummary;
