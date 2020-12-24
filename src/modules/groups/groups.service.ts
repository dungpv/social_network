import CreateGroupDto from "./dtos/create_group.dto";
import GroupSchema from "./groups.model";
import { HttpException } from "@core/exceptions";
import { IGroup, IMember } from "./groups.interface";
import { UserSchema } from "@modules/users";

export default class GroupService {
  public async createGroup(
    userId: string,
    groupDto: CreateGroupDto
  ): Promise<IGroup> {
    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) throw new HttpException(400, "User id is not exist");

    const existingGroup = await GroupSchema.find({
      $or: [{ name: groupDto.name }, { code: groupDto.code }],
    }).exec();
    if (existingGroup.length > 0)
      throw new HttpException(400, "Name or Code existed");

    const newGroup = new GroupSchema({
      ...groupDto,
    });

    const group = await newGroup.save();
    return group;
  }

  public async getAllGroup(): Promise<IGroup[]> {
    const groups = GroupSchema.find().exec();
    return groups;
  }

  public async updateGroup(
    groupId: string,
    groupDto: CreateGroupDto
  ): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) throw new HttpException(400, "Group id is not exist");

    const existingGroup = await GroupSchema.find({
      $or: [{ name: groupDto.name }, { code: groupDto.code }],
    }).exec();
    if (existingGroup.length > 0)
      throw new HttpException(400, "Name or Code existed");

    const groupFields = { ...groupDto };
    const updateGroup = await GroupSchema.findOneAndUpdate(
      { _id: groupId },
      { $set: groupFields },
      { new: true }
    ).exec();

    if (!updateGroup) throw new HttpException(400, "Update is not success");

    return updateGroup;
  }

  public async deleteGroup(groupId: string): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) throw new HttpException(400, "Group id is not exist");

    const deleteGroup = await GroupSchema.findOneAndDelete({
      _id: groupId,
    }).exec();
    if (!deleteGroup) throw new HttpException(400, "Delete is not success");

    return deleteGroup;
  }

  public async joinGroup(userId: string, groupId: string): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) throw new HttpException(400, "Group id is not exist");

    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) throw new HttpException(400, "User id is not exist");

    if (
      group.member_requests &&
      group.member_requests.some(
        (item: IMember) => item.user.toString() === userId
      )
    ) {
      throw new HttpException(
        400,
        "You has already been requested to join this group"
      );
    }

    if (
      group.members &&
      group.members.some((item: IMember) => item.user.toString() === userId)
    ) {
      throw new HttpException(
        400,
        "You has already been be member of this group"
      );
    }

    group.member_requests.unshift({ user: userId } as IMember);

    await group.save();
    return group;
  }

  public async approveJoinRequest(
    userId: string,
    groupId: string
  ): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) throw new HttpException(400, "Group id is not exist");

    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) throw new HttpException(400, "User id is not exist");

    if (
      group.member_requests &&
      group.member_requests.some(
        (item: IMember) => item.user.toString() !== userId
      )
    ) {
      throw new HttpException(400, "There is not any request of this user");
    }

    group.member_requests = group.member_requests.filter(
      ({ user }) => user.toString() !== userId
    );

    group.members.unshift({ user: userId } as IMember);

    await group.save();
    return group;
  }
}
