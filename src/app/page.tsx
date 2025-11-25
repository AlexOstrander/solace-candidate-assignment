"use client";

import { FormEvent, useEffect, useState } from "react";

type Advocate = {
  id?: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
};

type AdvocatesResponse = {
  data: Advocate[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedSearchTerm, setDisplayedSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState<number | undefined>(undefined);

  const fetchAdvocates = async (params: { q?: string; page?: number } = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (params.q && params.q.trim()) query.set("q", params.q.trim());
      if (params.page) query.set("page", params.page.toString());
      query.set("pageSize", pageSize.toString());

      const res = await fetch(`/api/advocates?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to load advocates");

      const json = await res.json();

      let data: Advocate[] = [];
      let totalFromApi: number | undefined;

      // Support both array response and { data, total, ... }
      if (Array.isArray(json)) {
        data = json as Advocate[];
      } else {
        const typed = json as AdvocatesResponse;
        data = typed.data ?? [];
        totalFromApi = typed.total;
      }

      setAdvocates(data);
      if (totalFromApi != null) setTotal(totalFromApi);
    } catch (e) {
      console.error(e);
      setError("Something went wrong while loading advocates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvocates({ page: 1 });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setDisplayedSearchTerm(searchTerm);
    fetchAdvocates({ q: searchTerm, page: 1 });
  };

  const handleReset = () => {
    setSearchTerm("");
    setDisplayedSearchTerm("");
    setPage(1);
    fetchAdvocates({ page: 1 });
  };

  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAdvocates({ q: displayedSearchTerm, page: nextPage });
  };

  const handlePrevPage = () => {
    const prevPage = Math.max(1, page - 1);
    setPage(prevPage);
    fetchAdvocates({ q: displayedSearchTerm, page: prevPage });
  };

  const hasPrevPage = page > 1;
  const listLength = advocates ? advocates.length : 0;
  const hasNextPage =
    total != null ? page * pageSize < total : listLength === pageSize;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Solace Advocates
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Find a mental health advocate who understands your needs, your
              story, and your community.
            </p>
          </div>
        </header>

        {/* Search */}
        <section className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            aria-label="Search advocates"
          >
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-slate-700"
              >
                Search by name, city, degree, specialty, or years of experience
              </label>
              <input
                id="search"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. Austin, MD, LGBTQ, trauma, 10"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              {displayedSearchTerm && (
                <p className="mt-1 text-xs text-slate-500">
                  Showing results for{" "}
                  <span className="font-medium text-slate-700">
                    “{displayedSearchTerm}”
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                Reset
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Loading / error */}
        {isLoading && (
          <div className="mb-4 text-sm text-slate-500">Loading advocates…</div>
        )}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="max-h-[520px] overflow-auto">
            <table className="min-w-full text-left text-sm text-slate-800">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    City
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Degree
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Specialties
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Experience
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!isLoading && advocates.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-slate-500"
                    >
                      No advocates found. Try adjusting your search.
                    </td>
                  </tr>
                )}

                {advocates.map((advocate) => (
                  <tr
                    key={
                      advocate.id ??
                      `${advocate.firstName}-${advocate.lastName}-${advocate.phoneNumber}`
                    }
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {advocate.firstName} {advocate.lastName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {advocate.city}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {advocate.degree}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {advocate.specialties.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {advocate.yearsOfExperience} yrs
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {String(advocate.phoneNumber)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
            <div>
              Page {page}
              {total != null && (
                <>
                  {" "}
                  · Showing {advocates.length} of {total} advocates
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={!hasPrevPage}
                className="rounded-lg border border-slate-300 px-3 py-1 font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={!hasNextPage}
                className="rounded-lg border border-slate-300 px-3 py-1 font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
