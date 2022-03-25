// originally sourced from https://github.com/raycast/extensions/tree/e63d962c7fbcf63f3515998bd13a6a9828a867f7/extensions/github-status

import { ActionPanel, List, Action, Icon, Color } from "@raycast/api";
import fetch from "node-fetch";
import { useAsync } from "react-use";

interface Status {
  status: MainStatus;
  incidents: StatusIncident[];
}

interface StatusIncident {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  shortlink: string;
  incident_updates: StatusIncidentUpdate[];
}

interface StatusIncidentUpdate {
  id: string;
  status: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface MainStatus {
  indicator: string;
  description: string;
}

const colorsMap: Record<string, string> = {
  none: Color.Green,
  partial_outage: Color.Yellow,
  major_outage: Color.Red,
};

const statusMap: Record<string, string> = {
  none: "Operational",
  partial_outage: "Partial Outage",
  major_outage: "Major Outage",
};

export default function Command() {
  const twitterData = useAsync<() => Promise<Status>>(
    () =>
      fetch("https://api.twitterstat.us/api/v2/status.json").then(async (res) => {
        return (await res.json()) as Status;
      }),
    []
  );

  const discordData = useAsync<() => Promise<Status>>(
    () =>
      fetch("https://www.discordstatus.com/api/v2/summary.json").then(async (res) => {
        return (await res.json()) as Status;
      }),
    []
  );

  // const instagramData = useAsync<() => Promise<Status>>(
  //   () =>
  //     fetch("https://www.githubstatus.com/api/v2/summary.json").then(async (res) => {
  //       return (await res.json()) as Status;
  //     }),
  //   []
  // );

  const githubData = useAsync<() => Promise<Status>>(
    () =>
      fetch("https://www.githubstatus.com/api/v2/summary.json").then(async (res) => {
        return (await res.json()) as Status;
      }),
    []
  );

  return (
    <List isLoading={githubData.loading}>
      {githubData.value?.incidents && (
        <List.Section title="Incidents">
          {githubData.value?.incidents?.map((incident) => (
            <List.Item
              key={incident.id}
              icon={{ source: Icon.ExclamationMark, tintColor: Color.Yellow }}
              title={incident.name}
              accessoryTitle={`${incident.incident_updates.length} updates`}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser title="Show Updates" url={incident.shortlink} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
      <List.Section title="Components">
        {githubData.value && (
          <List.Item
            key={"GitHub"}
            icon={{ source: Icon.Dot, tintColor: colorsMap[githubData.value!.status.indicator] }}
            title={"GitHub"}
            subtitle={githubData.value!.status.description}
            accessoryTitle={statusMap[githubData.value!.status.indicator]}
          />
        )}
        {twitterData.value && (
          <List.Item
            key={"Twitter"}
            icon={{ source: Icon.Dot, tintColor: colorsMap[twitterData.value!.status.indicator] }}
            title={"Twitter"}
            subtitle={twitterData.value!.status.description}
            accessoryTitle={statusMap[twitterData.value!.status.indicator]}
          />
        )}
        {discordData.value && (
          <List.Item
            key={"Discord"}
            icon={{ source: Icon.Dot, tintColor: colorsMap[discordData.value!.status.indicator] }}
            title={"Discord"}
            subtitle={discordData.value!.status.description}
            accessoryTitle={statusMap[discordData.value!.status.indicator]}
          />
        )}
      </List.Section>
    </List>
  );
}
