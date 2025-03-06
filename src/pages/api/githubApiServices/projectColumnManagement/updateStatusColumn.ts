const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function getUpdateStatusOptionMutation() {
  return `
    mutation UpdateStatusOption($projectId: ID!, $fieldId: ID!, $optionId: ID!, $newName: String!) {
      updateProjectV2SingleSelectFieldOption(
        input: {
          projectId: $projectId
          fieldId: $fieldId
          optionId: $optionId
          name: $newName
        }
      ) {
        projectV2SingleSelectFieldOption {
          id
          name
        }
      }
    }
  `;
}

export async function updateStatusColumn(
  projectId: string,
  fieldId: string,
  optionId: string,
  newName: string
) {
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getUpdateStatusOptionMutation(),
        variables: { projectId, fieldId, optionId, newName },
      }),
    });

    const data = await response.json();

    console.log('GraphQL Response:', JSON.stringify(data, null, 2));

    if (!data?.data?.updateProjectV2SingleSelectFieldOption) {
      console.error('Error: Could not update option.');
      console.error('Full Response:', data);
      return null;
    }

    console.log(
      'Updated Option:',
      data.data.updateProjectV2SingleSelectFieldOption
        .projectV2SingleSelectFieldOption
    );
    return data.data.updateProjectV2SingleSelectFieldOption
      .projectV2SingleSelectFieldOption;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
