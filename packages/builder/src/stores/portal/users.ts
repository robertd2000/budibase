import { API } from "@/api"
import { licensing } from "."
import { sdk } from "@budibase/shared-core"
import { Constants } from "@budibase/frontend-core"
import {
  BaseUser,
  DeleteInviteUsersRequest,
  InviteUsersRequest,
  SearchUsersRequest,
  SearchUsersResponse,
  UpdateInviteRequest,
  User,
  UserIdentifier,
} from "@budibase/types"
import { BudiStore } from "../BudiStore"

interface UserInfo {
  email: string
  password: string
  forceResetPassword?: boolean
  role: keyof typeof Constants.BudibaseRoles
}

type UserState = SearchUsersResponse & SearchUsersRequest

class UserStore extends BudiStore<UserState> {
  constructor() {
    super({
      data: [],
    })

    // Update quotas after any add or remove operation
    this.create = this.refreshUsage(this.create)
    this.save = this.refreshUsage(this.save)
    this.delete = this.refreshUsage(this.delete)
    this.bulkDelete = this.refreshUsage(this.bulkDelete)
  }

  async search(opts: SearchUsersRequest = {}) {
    const paged = await API.searchUsers(opts)
    this.set({
      ...paged,
      ...opts,
    })
    return paged
  }

  async get(userId: string) {
    try {
      return await API.getUser(userId)
    } catch (err) {
      return null
    }
  }

  async fetch() {
    return await API.getUsers()
  }

  async onboard(payload: InviteUsersRequest) {
    return await API.onboardUsers(payload)
  }

  async invite(
    payload: {
      admin?: boolean
      builder?: boolean
      creator?: boolean
      email: string
      apps?: any[]
      groups?: any[]
    }[]
  ) {
    const users: InviteUsersRequest = payload.map(user => {
      let builder = undefined
      if (user.admin || user.builder) {
        builder = { global: true }
      } else if (user.creator) {
        builder = { creator: true }
      }
      return {
        email: user.email,
        userInfo: {
          admin: user.admin ? { global: true } : undefined,
          builder,
          userGroups: user.groups,
          roles: user.apps ? user.apps : undefined,
        },
      }
    })
    return API.inviteUsers(users)
  }

  async removeInvites(payload: DeleteInviteUsersRequest) {
    return API.removeUserInvites(payload)
  }

  async acceptInvite(
    inviteCode: string,
    password: string,
    firstName: string,
    lastName?: string
  ) {
    return API.acceptInvite({
      inviteCode,
      password,
      firstName,
      lastName: !lastName?.trim() ? undefined : lastName,
    })
  }

  async fetchInvite(inviteCode: string) {
    return API.getUserInvite(inviteCode)
  }

  async getInvites() {
    return API.getUserInvites()
  }

  async updateInvite(code: string, invite: UpdateInviteRequest) {
    return API.updateUserInvite(code, invite)
  }

  async getUserCountByApp(appId: string) {
    return await API.getUserCountByApp(appId)
  }

  async create(data: { users: UserInfo[]; groups: any[] }) {
    let mappedUsers: BaseUser[] = data.users.map(user => {
      const body: BaseUser = {
        email: user.email,
        password: user.password,
        roles: {},
      }
      if (user.forceResetPassword) {
        body.forceResetPassword = user.forceResetPassword
      }

      switch (user.role) {
        case Constants.BudibaseRoles.AppUser:
          body.builder = { global: false }
          body.admin = { global: false }
          break
        case Constants.BudibaseRoles.Developer:
          body.builder = { global: true }
          break
        case Constants.BudibaseRoles.Creator:
          body.builder = { creator: true, global: false }
          break
        case Constants.BudibaseRoles.Admin:
          body.admin = { global: true }
          body.builder = { global: true }
          break
      }

      return body
    })
    const response = await API.createUsers(mappedUsers, data.groups)

    // re-search from first page
    await this.search()
    return response
  }

  async delete(id: string) {
    await API.deleteUser(id)
  }

  async bulkDelete(users: UserIdentifier[]) {
    return API.deleteUsers(users)
  }

  async save(user: User) {
    return await API.saveUser(user)
  }

  async addAppBuilder(userId: string, appId: string) {
    return await API.addAppBuilder(userId, appId)
  }

  async removeAppBuilder(userId: string, appId: string) {
    return await API.removeAppBuilder(userId, appId)
  }

  async getAccountHolder() {
    return await API.getAccountHolder()
  }

  getUserRole(user?: User & { tenantOwnerEmail?: string }) {
    if (!user) {
      return Constants.BudibaseRoles.AppUser
    }
    if (user.email === user.tenantOwnerEmail) {
      return Constants.BudibaseRoles.Owner
    } else if (sdk.users.isAdmin(user)) {
      return Constants.BudibaseRoles.Admin
    } else if (sdk.users.isBuilder(user)) {
      return Constants.BudibaseRoles.Developer
    } else if (sdk.users.hasCreatorPermissions(user)) {
      return Constants.BudibaseRoles.Creator
    } else {
      return Constants.BudibaseRoles.AppUser
    }
  }

  // Wrapper function to refresh quota usage after an operation,
  // persisting argument and return types
  refreshUsage<T extends any[], U>(fn: (...args: T) => Promise<U>) {
    return async function (...args: T) {
      const response = await fn(...args)
      await licensing.setQuotaUsage()
      return response
    }
  }
}

export const users = new UserStore()
