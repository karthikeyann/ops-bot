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

import { ADMIN_PERMISSION, featureIsDisabled, getExternalPRBranchName, isOkayToTestComment, validCommentsExistByPredicate, WRITE_PERMISSION } from "../../shared";
import { PRContext } from "../../types";

export class PRExternalContributors {
    constructor(private context: PRContext) {
        
    }

    async pipePR(): Promise<any> {
        const { payload } = this.context
        if (await featureIsDisabled(this.context, "external_contributors")) return;

        // pull_request.opened event
        if(payload.action == "opened") {
            // make sure author is external contributor
            if(await this.authorIsNotExternalContributor(payload.sender.login, payload.organization?.login)) return
            
            return await this.context.octokit.issues.createComment({
                owner: payload.repository.owner.login,
                repo: payload.repository.name,
                issue_number: payload.pull_request.number,
                body: "Pull requests from external contributors require approval from a RAPIDS organization member before CI can begin."
            })
        }

        // pull_request.synchronize
        if(payload.action == "synchronize" || payload.action == "reopened") {
            // check for valid comments
            if(!await validCommentsExistByPredicate(
                this.context, 
                this.context.payload.pull_request.number,
                [ADMIN_PERMISSION, WRITE_PERMISSION],
                comment => isOkayToTestComment(comment.body || "") && !!comment.user)
            ) return
            
            // Update commit on the source repository branch to match forked branch
            try {
                return await this.context.octokit.rest.git.updateRef({
                    ref: `heads/${getExternalPRBranchName(payload.pull_request.number)}`,
                    repo: payload.repository.name,
                    owner: payload.repository.owner.login,
                    sha: payload.pull_request.head.sha,
                    force: true
                })
            } catch {
                return await this.context.octokit.rest.git.createRef({
                    ref: `refs/heads/${getExternalPRBranchName(payload.pull_request.number)}`,
                    repo: payload.repository.name,
                    owner: payload.repository.owner.login,
                    sha: payload.pull_request.head.sha,
                })
            }
        }

        // pull_request.closed
        if(payload.action == "closed") {
            // Delete the source repository branch
            const branchName = getExternalPRBranchName(payload.pull_request.number)
            try {
                return this.context.octokit.rest.git.deleteRef({
                    ref: `heads/${branchName}`,
                    repo: payload.repository.name,
                    owner: payload.repository.owner.login,
                })
            } catch {
                // do nothing
            }
        }
    }


    /**
     * Determines whether or not the provided author is an external 
     * contributor
     * @param author 
     * @param org 
     * @returns 
     */
    private async authorIsNotExternalContributor(author: any, org: any) {
        return this.context.octokit.orgs.checkMembershipForUser({username: author, org})
        .then(data => data.status == (204 as any))
        .catch(_ => false)
    }
}

