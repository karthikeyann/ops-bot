/*
* Copyright (c) 2022, NVIDIA CORPORATION.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import {
  mockConfigGet,
  mockContextRepo,
  mockCreateComment,
  mockCreateCommitStatus,
  mockCreateRef,
  mockCreateRelease,
  mockDeleteRef,
  mockGetByUsername,
  mockCheckMembershipForUser,
  mockGetRef,
  mockGetReleaseByTag,
  mockGetUserPermissionLevel,
  mockListComments,
  mockListCommits,
  mockListPullRequestsFromCommit,
  mockListPulls,
  mockListReviews,
  mockMerge,
  mockPaginate,
  mockPullsGet,
  mockUpdateRef,
  mockUpdateRelease,
} from "../../mocks";
import type { EmitterWebhookEventName } from "@octokit/webhooks/dist-types/types";

export const makeContext = (payload, name: EmitterWebhookEventName) => {
  return {
    name,
    payload,
    repo: mockContextRepo,
    octokit: {
      issues: {
        listComments: mockListComments,
        createComment: mockCreateComment
      },
      pulls: {
        get: mockPullsGet,
        list: mockListPulls,
        listReviews: mockListReviews,
        merge: mockMerge,
      },
      repos: {
        createCommitStatus: mockCreateCommitStatus,
        createRelease: mockCreateRelease,
        getCollaboratorPermissionLevel: mockGetUserPermissionLevel,
        listCommits: mockListCommits,
        listPullRequestsAssociatedWithCommit: mockListPullRequestsFromCommit,
        getReleaseByTag: mockGetReleaseByTag,
        updateRelease: mockUpdateRelease,
      },
      users: {
        getByUsername: mockGetByUsername,
      },
      paginate: mockPaginate,
      config: {
        get: mockConfigGet,
      },
      orgs: {
        checkMembershipForUser: mockCheckMembershipForUser
      },
      rest: {
        git: {
          updateRef: mockUpdateRef,
          getRef: mockGetRef,
          deleteRef: mockDeleteRef,
          createRef: mockCreateRef
        }
      }
    },
  };
};
