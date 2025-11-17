<script setup lang="ts">
import missionBus from '@/utils/missionBus';
import checkbox from './checkbox.vue';
import Dialog from './Dialog.vue';
const {
	init,
	joinNetwork,
	localJsonData,
	updateLocalJsonData,
	zerotierStatus,
	closeNetwork,
	updateLoaclNetwork,
	authAdminToken,
	networkAdminService,
	syncNetworkMember,
	checkMemberName,
	memberListUpdateCount,
	uploadFileInfo,
	memberAuthorized,
	pingMember
} = missionBus
import { vMouseMenuDirective } from './MouseMenu.vue'
const vMouseMenu = vMouseMenuDirective
const icons = inject('icons') as Record<string, string>
onMounted(() => {
	init()
})
//Update local nickname
const updateNickname = () => {
	updateLocalJsonData()
	syncNickname()
}
//Sync nickname across network
const syncNickname = () => {
	if (selectedNetworkId.value) {
		let netId = selectedNetworkId.value
		checkMemberName(netId, {
			id: zerotierStatus.address,
			name: localJsonData.nickname
		})
	}
}
//Network list for display
const joinedNetworkList: Ref<userNetwork[]> = computed(() => {
	//Local network list cache
	if (Array.isArray(localJsonData.joinedNetworkList)) {
		return localJsonData.joinedNetworkList
	} else {
		return []
	}
})
//Add network
const joinNetworkId = ref('')
let settingBox: Ref<userNetwork> = ref({
	allowManaged: true,
	allowGlobal: false,
	allowDefault: false,
	allowDNS: false,
})
watch(settingBox, (v) => {
	// console.log(v)
}, {
	deep: true
})
//Trigger update
const settingBoxUpdate = () => joinNetworkUpdate()
const joinNetworkDialogShow = ref(false)
const joinNetworkDialog = () => {
	joinNetworkDialogShow.value = true
}
//Join network from dialog ID
const joinNetworkConfirm = () => {
	joinNetworkDialogShow.value = false
	joinNetwork(joinNetworkId.value, {
		allowManaged: true,
		allowGlobal: false,
		allowDefault: false,
		allowDNS: false,
	}).finally(() => {
		joinNetworkId.value = ''
	})
}
//Join & update network
const joinNetworkUpdate = (net?: userNetwork) => {
	let settintObj = {}
	let netId = ''
	//Double click from list
	if (net) {
		let { id, allowManaged, allowGlobal, allowDefault, allowDNS } = net
		netId = id || ''
		Object.assign(settintObj, { allowManaged, allowGlobal, allowDefault, allowDNS })
	} else {
		netId = selectedNetworkId.value
		let netIndex = joinedNetworkList.value.findIndex(e => e.id == netId)
		//Connect from existing list
		if (netIndex >= 0) {
			let { allowManaged, allowGlobal, allowDefault, allowDNS } = joinedNetworkList.value[netIndex]
			Object.assign(settintObj, { allowManaged, allowGlobal, allowDefault, allowDNS })
		} else {
			//Connect from details
			settintObj = JSON.parse(JSON.stringify(settingBox.value))
		}
	}

	joinNetwork(netId, settintObj).then((res: any) => {
		//Select and update
		selectNetwork(res.data)

		let netIndex = joinedNetworkList.value.findIndex(e => e.id == netId)
		// selectedNetworkCopy.value = joinedNetworkList.value[netIndex]
	})
}
//Leave network
const leaveNetwork = () => {
	window.$modal('Leave Network').then(res => {
		//Leave
		let netId = selectedNetworkId.value
		closeNetwork(netId).then(res => {
			// console.log()
			let netIndex = joinedNetworkList.value.findIndex(e => e.id == netId)
			if (netIndex >= 0) {
				joinedNetworkList.value[netIndex]['status'] = 'undefined'
				updateLocalJsonData()
				// selectedNetworkCopy.value = joinedNetworkList.value[netIndex]
			}
			// selectedNetworkId.value = ''
		})
	})
}

//Selected network
const selectedNetworkId = ref('')
// let selectedNetworkCopy: Ref<userNetwork> = ref({});
const selectedNetworkCopy = computed(() => {
	let netId = selectedNetworkId.value
	let netIndex = joinedNetworkList.value.findIndex(e => e.id == netId)
	return joinedNetworkList.value[netIndex]
})
const selectNetwork = (net: userNetwork) => {
	selectedNetworkId.value = net.id || ''
	// selectedNetworkCopy.value = reactive(net)
	settingBox.value.allowManaged = net.allowManaged
	settingBox.value.allowGlobal = net.allowGlobal
	settingBox.value.allowDefault = net.allowDefault
	settingBox.value.allowDNS = net.allowDNS
	syncNickname()
	// console.log(net)
	// console.log(settingBox)
}

//Network details
const myip = computed(() => {
	let arr = selectedNetworkCopy.value.assignedAddresses
	if (Array.isArray(arr)) {
		let str = arr.map(s => s.replace(/\/\d+/, '')).join(',')
		return str || 'No IP Assigned'
	} else {
		return 'No IP Assigned'
	}
})
//Status display
let statusMap: Record<string, string[]> = {
	'OK': ['Connected', '#00c500', 'pass'],
	'REQUESTING_CONFIGURATION': ['Awaiting Authorization', '#1296db', 'wait'],
	"ACCESS_DENIED": ['Awaiting Authorization', '#1296db', 'wait'],
	'undefined': ['Not Connected', '#8A8A8A', 'closed']
}
const myStatus = computed(() => {
	let status = selectedNetworkCopy.value.status
	// if (status) {
	let [name, color, icon] = statusMap[String(status)]
	return { name, color, icon }
	// } else {
	// 	return {
	// 		name: 'Not Connected',
	// 		color: '#8A8A8A',
	// 		icon:'closed'
	// 	}
	// }
})
//List status display
const listStatus = (status: string | undefined) => {
	let [name, color, icon] = statusMap[String(status)]
	return icon
}
//Administrator features
const adminToken = ref('')
const adminControllerUrl = ref('')
const adminTokenNetId = ref()
const adminTokenShow = ref(false)
const adminTokenShowConfirm = () => {
	//Verify network management permissions
	let netId = adminTokenNetId.value as string
	let token = adminToken.value
	let controllerUrl = adminControllerUrl.value.trim()
	authAdminToken(netId, token, controllerUrl || undefined)
	adminTokenShow.value = false
}
//Network list right-click menu
const listMouseContxt: (net: userNetwork) => any[] = (net: userNetwork) => {
	return [{
		label: 'Admin Token',
		callback: () => {
			//Popup to enter ID
			adminToken.value = net.Authorization?.replace('token ', '') || ''
			adminControllerUrl.value = net.controllerUrl || ''
			adminTokenShow.value = true
			adminTokenNetId.value = net.id
		}
	}]
}
//Network member list
const memberList = computed(() => {
	console.log('Member list refresh count', memberListUpdateCount.value)
	memberListUpdateCount.value
	if (selectedNetworkId.value) {
		let memberList = selectedNetworkCopy.value.memberList || reactive([])
		let adminIds = selectedNetworkCopy.value.adminIds || reactive([])
		//Put self at front, special color for icon, special color for admin, distinguish authorized/unauthorized
		let list = memberList.map((member: netMember) => {
			let icon = 'user'
			let sortc = 4
			if (member.authorized) {
				icon = 'user-online'
				sortc = 3
			}
			if (member.id == zerotierStatus.address) {
				icon = 'user-self'
				sortc = 2
			}
			if (adminIds.includes(member.id)) {
				icon = 'user-admin'
				sortc = 1
			}
			// console.log(member)
			return {
				...member,
				icon,
				sortc
			}
		}).sort((a, b) => a.sortc - b.sortc)
		return list
	}
	return []
})
const memberMouseContxt = (memberId: string | undefined) => {
	return () => {
		let member = selectedNetworkCopy.value.memberList?.find(e => e.id == memberId) || {}
		return [{
			label: 'ID: ' + member.id,
			callback: () => {
				copyText(member.id)
			}
		},/* {
				label: 'Nickname: ' + member.name,
				callback: () => {}
		}, */{
			label: 'IP: ' + member.ip,
			callback: () => {
				copyText(member.ip)
			}
		}, member.authorized ? {
			label: 'Revoke Authorization',
			callback: () => {
				// copyText(member.ip)
				let netId = selectedNetworkId.value
				let memberId = String(member.id)
				window.$message('Revoking authorization')
				memberAuthorized(netId, memberId, false).then((res: any) => {
					console.log(res)
					if (res.status == 'success') {
						window.$message('Revoked successfully')
						memberRefresh(netId)
					}
				})
			}
		} : {
			label: 'Authorize',
			callback: () => {
				let netId = selectedNetworkId.value
				let memberId = String(member.id)
				window.$message('Authorizing')
				memberAuthorized(netId, memberId, true).then((res: any) => {
					if (res.status == 'success') {
						window.$message('Authorized successfully')
						memberRefresh(netId)
					}
				})
			}
		}
			// {
			// 	label: 'Send file to them',
			// 	callback: () => {
			// 		sendFileShow.value = true
			// 		sendFileShowTitle.value = `Send to ${member.name || member.id}`
			// 		sendMember.value = member
			// 		console.log('member', sendMember.value.ip)
			// 		// window.$message('Next time for sure')
			// 	}
			// }
		]
	}
}
//Refresh network members
const memberRefresh = (netId: string | undefined) => {
	window.$message('Refreshing')
	syncNetworkMember(String(netId))
}
//Ping network members
let pingMap: Record<string, string> = reactive({})
const pingMemberByNet = () => {
	window.$message('Ping')
	selectedNetworkCopy.value.memberList?.forEach(member => {
		let mIp = member.ip as string
		if (!mIp) return
		pingMember(mIp).then((pings: any) => {
			pingMap[String(member.id)] = pings
			// console.log(pingMap)
		})
	})
}
//Send file
const sendFileShow = ref(false)
const sendFileShowTitle = ref('')
const sendFileShowPath = ref('')
const sendMember: Ref<netMember> = ref({})
let sendFile: File | null = null
const selectFileChange = (e: any) => {
	// console.log('选择文件', e)
	// sendlog.log('Select file', e.target.value)
	let file = e.target.files[0];
	sendFile = file
	sendFileShowPath.value = file.path
	console.log('Select file', file)
}
const sendFileShowConfirm = () => {
	if (sendFile && sendMember.value.id) {
		console.log('Send IP', sendMember.value.ip)
		uploadFileInfo({
			file: sendFile,
			memberIps: [String(sendMember.value.ip)],
			originId: zerotierStatus.address,
			takeId: String(sendMember.value.id)
		})
	}
	sendFileShow.value = false
}
//Click to copy
const copyText = (text: string | number | undefined) => {
	if (text) {
		navigator.clipboard.writeText(text.toString());
		window.$message('Copied  ' + text)
	}
}
</script>

<template>
	<div class="join-page">
		<!-- Network list -->
		<div class="left">
			<div class="info">
				<div class="info-item" style="color: #FDB25D;">
					Local Info
				</div>
				<div class="info-item">
					<div>ID</div>
					<div style="font-size: 1.05rem;cursor: pointer;" @click="copyText(zerotierStatus.address)">
						<span>{{ zerotierStatus.address }}</span>
						<!-- <img src="/copy.svg" /> -->
					</div>
				</div>
				<div class="info-item">
					<div>Nickname</div>
					<input v-model="localJsonData.nickname" @blur="updateNickname" placeholder="name" class="nickname-input" />
				</div>
			</div>
			<div class="list-title">
				<div>Network List</div>
				<div class="icons"><img @click="joinNetworkDialog" title="Add" :src="icons.add" /></div>
			</div>
			<div class="list">
				<div v-for="net in joinedNetworkList" class="list-item" @click="selectNetwork(net)"
					@dblclick="joinNetworkUpdate(net)" v-mouse-menu="() => listMouseContxt(net)">
					<img style="transform: translateY(1px);" :src="icons.vlan" />
					<span class="text">{{ net.name || net.id }}</span>
					<img v-show="listStatus(net.status) == 'pass'" class="pass" :src="icons.pass" />
					<img v-show="listStatus(net.status) == 'wait'" class="pass" :src="icons.wait" />
					<img class="delete" @click.stop title="Delete" :src="icons.delete" />
				</div>
			</div>
		</div>
		<div class="right">
			<template v-if="selectedNetworkId">
				<div class="top">
					<div class="info">
						<span class="name" :title="selectedNetworkCopy.name || ''">{{ selectedNetworkCopy.name ||
						'Unknown Network' }}</span>
						<span>ID <span class="underline" @click="copyText(selectedNetworkCopy.id)">{{
						selectedNetworkCopy.id
					}}</span></span>
						<span>IP <span class="underline" @click="copyText(myip)">{{ myip }}</span></span>
						<span :style="{ color: myStatus.color }" style="text-align: right;">{{ myStatus.name }}</span>
					</div>
					<div v-if="selectedNetworkCopy.controllerUrl" class="controller-info">
						<span style="color: #8A8A8A;">Controller: </span>
						<span class="underline" @click="copyText(selectedNetworkCopy.controllerUrl)" :title="selectedNetworkCopy.controllerUrl">
							{{ selectedNetworkCopy.controllerUrl }}
						</span>
					</div>
					<div class="setting">
						<div class="button">
							<div class="setting-item">
								<checkbox v-model:value="settingBox.allowManaged" @update:value="settingBoxUpdate"
									keyname="allowManaged" />
								<span class="text">Enable Connection</span>
							</div>
							<div class="setting-item">
								<checkbox v-model:value="settingBox.allowGlobal" @update:value="settingBoxUpdate"
									keyname="allowGlobal" />
								<span class="text">Global Connection</span>
							</div>
						</div>
						<div v-show="myStatus.icon != 'colsed'" class="close">
							<span @click="joinNetworkUpdate()" class="link">Connect</span>
							<span @click="leaveNetwork" class="leave">Disconnect</span>
						</div>
					</div>
				</div>
				<div class="right-body">
					<div class="member">
						<div class="member-title">
							<span>Network Members</span>
							<img class="refresh" :src="icons.refresh" @click="memberRefresh(selectedNetworkCopy.id)" />
							<span class="ping" @click="pingMemberByNet">Ping</span>
						</div>
						<div class="member-grid">
							<div v-for="m in memberList" :key="m.id" v-mouse-menu="memberMouseContxt(m.id)" class="member-item">
								<img class="icon" :src="icons[m.icon]" />
								<div class="name-body">
									<span class="name">{{ m.name || m.id }}</span>
									<span class="ping">{{pingMap[String(m.id)]}}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
			<div v-else class="empty-body">
				<img class="icon" :src="icons.ZeroTier" />
				<div class="empty-button" @click="joinNetworkDialog">
					Add Network
				</div>
			</div>
		</div>
		<!-- Join network settings -->
		<!-- allowManaged: Allow managed. Default yes. Allow ZeroTier to set IP addresses and routes (local/private range only)
			allowGlobal: Allow global. Default no. Allow ZeroTier to set global/public/non-private range IPs and routes.
			allowDefault: Allow default. Default no. Allow ZeroTier to set default route on the system. See full tunnel mode.
			allowDNS: Allow DNS. Default no. Allow ZeroTier to set DNS servers.-->
		<Dialog v-model:show="joinNetworkDialogShow" title="Network ID" @confirm="joinNetworkConfirm">
			<div class="net-id-input">
				<input v-model="joinNetworkId" class="input">
			</div>
		</Dialog>
		<Dialog v-model:show="adminTokenShow" title="Admin Token & Controller" @confirm="adminTokenShowConfirm">
			<div class="net-id-input">
				<div class="text">Admin Token</div>
				<input v-model="adminToken" class="input" placeholder="Enter admin token">
			</div>
			<div class="net-id-input" style="margin-top: 1rem;">
				<div class="text">Controller URL (optional)</div>
				<input v-model="adminControllerUrl" class="input" placeholder="e.g., http://192.168.1.100:3000/api/v1/">
			</div>
		</Dialog>
		<Dialog v-model:show="sendFileShow" :title="sendFileShowTitle" @confirm="sendFileShowConfirm">
			<div class="net-id-input">
				<input id="selectfile" @change="selectFileChange" type="file" v-show="false">
				<label class="selectfile-label" for="selectfile">
					{{ sendFileShowPath || 'Click to select file' }}
				</label>
			</div>
		</Dialog>

	</div>
</template>

<style lang="less" scoped>
.join-page {
	@title-size: 1.1rem;
	@padding-top: 1rem;
	height: 100%;
	display: flex;

	.left {
		width: 12rem;
		border-right: 1px solid #323437;
		display: flex;
		overflow: auto;
		flex-direction: column;
		padding: 0 1rem 0 0;

		.info {
			margin: @padding-top 0 1.5rem;
			font-size: @title-size;
			border-bottom: 1px solid #484849;
		}

		.info-item {
			display: flex;
			justify-content: space-between;
			margin: 0 0 .5rem;

			.nickname-input {
				background-color: transparent;
				border: none;
				width: 8rem;
				caret-color: white;
				text-align: right;
				color: white;
				font-weight: bold;
				font-size: @title-size;

				&:focus-visible {
					outline: none;
				}
			}
		}

		.list-title {
			margin: 0 0 0.5rem 0;
			color: #FDB25D;
			font-size: @title-size;
			display: flex;

			.icons {
				height: auto;
				display: flex;
				align-items: center;
				padding-left: 1rem;

				img {
					width: 1.2rem;
					cursor: pointer;
				}
			}
		}

		.list {
			overflow-y: scroll;
			overflow-x: hidden;
			flex-grow: 1;
			height: 10rem;

		}

		.list-item {
			font-size: 0.8rem;
			margin: 0.2rem 0;
			padding: 0.6rem 0 0.6rem 0.4rem;
			cursor: pointer;
			display: flex;
			align-items: center;
			border-radius: 10px;

			&:hover {
				background-color: #323437;

				.pass {
					display: none;
				}

				.delete {
					display: block;
				}
			}

			.pass {
				display: block;
			}

			.delete {
				display: none;
			}

			.text {
				margin: 0 1rem 0 0.4rem;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				width: 7.5rem;
			}
		}
	}

	.right {
		padding: 0 @padding-top ;
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		.title {
			font-size: 1.1rem;
			color: #FDB25D;
		}

		.top {
			background-color: #36383D;
			border-radius: 10px;
			padding: 1rem;

			.setting {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin: 1rem 0 0;

				.button {
					display: flex;
					align-items: center;
				}

				.setting-item {
					display: flex;
					align-items: center;
					border-radius: 10px;
					font-size: 0.9rem;
					margin: 0 1rem 0 0;

					.text {
						margin: 0 0 0 .3rem;
						color: #dddddd;
					}
				}

				.close {
					color: #ff7973;
					font-size: .9rem;

					.link {
						cursor: pointer;
						color: #FDB25D;
						margin: 0 1rem 0 0;
					}

					.leave {
						cursor: pointer;
					}
				}
			}
		}

		.info {
			display: flex;
			align-items: baseline;
			font-size: .9rem;

			& * {
				flex-grow: 1;
			}
			.name {
				font-size: 1.1rem;
				color: #FDB25D;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 8rem;
			}
		}

		.controller-info {
			margin-top: 0.5rem;
			font-size: 0.85rem;
			display: flex;
			align-items: center;
			color: #dddddd;

			span:last-child {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 30rem;
			}
		}

		.underline {
			text-decoration: underline dotted;
			cursor: pointer;
		}

		.right-body {
			flex-grow: 1;
			display: flex;
			padding: 1rem;

			.member {
				flex-grow: 1;
				display: flex;
				flex-direction: column;

				.member-title {
					font-size: .9rem;
					display: flex;

					.refresh {
						margin: 0 1rem;
						cursor: pointer;
					}

					.ping {
						cursor: pointer;
					}
				}

				.member-grid {
					display: grid;
					grid-template-columns: repeat(auto-fill, min(45%, 15rem));

					grid-template-rows: repeat(auto-fill, 2rem);
					gap: 1rem;
					flex-grow: 1;
					height: 10rem;
					overflow-y: scroll;
					overflow-x: hidden;
					padding: 1rem 0;

					.member-item {
						display: flex;
						align-items: center;
						font-weight: 500;
						color: #DAEAD0;
						cursor: pointer;
						padding: 0 0 0 .5rem;
						border-radius: 20px;
						font-size: 1rem;
						transition: border .3s;
						border: 1px solid transparent;

						&:hover {
							border: 1px solid #88910c;

						}

						.icon {
							width: 1.2rem;
							margin: 0 .5rem 0 0;
						}

						.name-body{
							display: flex;
							align-items: center;
							justify-content: space-between;
							flex-grow: 1;
							padding: 0 1rem 0 0;
						}
						.name {
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						.ping{
							font-size: .8rem;
							color: white;
						}
					}
				}
			}
		}

		.empty-body {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			flex-grow: 1;
			font-size: 1.4rem;
			color: white;
			transform: translateY(-4rem);

			.icon {
				border-radius: 20px;
				width: 5rem;
				margin: 0 0 1rem;
			}

			.empty-button {
				&:hover {
					color: #FDB25D;
					cursor: pointer;
				}
			}
		}
	}

}

.selectfile-label {
	border: 1px dashed;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 5rem;
	border-radius: 10px;
	color: #dbdbdb;
	font-weight: 500;
	cursor: pointer;
}

.net-id-input {

	/* display: flex; */
	// align-items: baseline;
	// padding: 0 1rem;
	/* height: 2rem; */
	/* font-size: 1.1rem; */
	.text {
		font-size: .9rem;
		color: #c5c5c5;
		margin: 0 0 .3rem;
	}

	.input {
		background-color: transparent;
		border: none;
		/* width: 8rem; */
		caret-color: white;
		/* text-align: right; */
		color: white;
		font-weight: bold;
		/* flex-grow: 1; */
		border: 1px solid #909090;
		font-size: 1.1rem;
		border-radius: 10px;
		padding: .5rem 1rem;
		width: calc(calc(100% - 2rem) - 2px);
		transition: box-shadow .3s;

		&:focus-visible {
			outline: none;
			box-shadow: 0 0 0px 2px #FDB25D;
		}

		&:hover {
			border: 1px solid #FDB25D;
		}
	}
}
</style>