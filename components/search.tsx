"use client";
import {
  SearchDialog,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogFooter,
  SearchDialogClose,
  TagsList,
  TagsListItem,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";
import { useState } from "react";
import { algoliasearch } from "algoliasearch";
import { useDocsSearch } from "fumadocs-core/search/client";

const appId = "0T4ZBDJ3AF";
const apiKey = "9b74c8a3bba6e59a00209193be3eb63a";
const indexName = "builder-hub";

const client = algoliasearch(appId, apiKey);

const tagItems = [
  { name: "Docs", value: "docs" },
  { name: "Academy", value: "academy" },
  { name: "Integrations & Guides", value: "ig" },
];

export default function CustomSearchDialog(props: SharedProps) {
  const [tag, setTag] = useState<string | undefined>("docs");
  const { search, setSearch, query } = useDocsSearch(
    {
      type: "algolia",
      indexName,
      client: client as any,
    },
    "en",
    tag
  );

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogInput placeholder="Search documentation..." />
          <SearchDialogClose />
        </SearchDialogHeader>

        <SearchDialogList
          items={query.data === "empty" ? [] : query.data || []}
        />

        <SearchDialogFooter>
          <div className="flex items-center justify-between w-full">
            <TagsList tag={tag} onTagChange={setTag} allowClear={true}>
              {tagItems.map((item) => (
                <TagsListItem key={item.value} value={item.value}>
                  {item.name}
                </TagsListItem>
              ))}
            </TagsList>
            <a
              href="https://algolia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Search powered by Algolia
            </a>
          </div>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
