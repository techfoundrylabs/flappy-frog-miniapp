"use client";

import { PizzaThrowGame } from "../components/PizzaThrowGame";

export default function PizzaThrowerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Pizza Thrower</h1>
      <PizzaThrowGame />
    </div>
  );
}