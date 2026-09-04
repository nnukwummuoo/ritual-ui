"use client";

import { useParams } from "next/navigation";
import CreatorPortfolioView from "../_components/CreatorPortfolioView";

export default function Page() {
  const params = useParams<{ creator_portfolio_id: string }>();
  const id = params?.creator_portfolio_id?.split(",")[0] || "";
  if (!id) return null;
  return <CreatorPortfolioView creatorPortfolioId={id} />;
}