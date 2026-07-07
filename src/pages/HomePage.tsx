/**
 * pages/HomePage.tsx
 * Trang chủ – tập hợp các section marketing. Điều hướng nội bộ dùng hash (#id).
 */
import Hero from '../components/Hero';
import Products from '../components/Products';
import ConsultingAndTraining from '../components/ConsultingAndTraining';
import NewsSection from '../components/NewsSection';
import EstimationLibrary from '../components/EstimationLibrary';
import Customers from '../components/Customers';
import Seo from '../seo/Seo';
import {
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
} from '../seo/structuredData';

export default function HomePage() {
  return (
    <>
      <Seo
        path="/"
        jsonLd={[organizationSchema(), websiteSchema(), softwareApplicationSchema()]}
      />
      <Hero />
      <Products />
      <ConsultingAndTraining />
      <NewsSection />
      <EstimationLibrary />
      <Customers />
    </>
  );
}
