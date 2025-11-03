import { CodeName } from "@/utils/errcode";
import { useRequest } from "vue-request";
import { sendlog } from "@/utils/log";
let missionCount = 0;
let missionPromise = null;
const timeoutfn = () => {
  // window.nodeAPI.installZero()
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
      sendlog.log("timeout");
    }, 5000);
  });
};
// ==============================================================================
// ==                                   Task Scheduler Core                     ==
// ==============================================================================

const installZero = () => window.nodeAPI.installZero();
const getToken = () => window.nodeAPI.readZerotierToken();
const startService = () => window.nodeAPI.starteZero();
// sendlog.log()

//Preset error fixes
let defaultError: Record<string, missionObject> = {
  401: {
    icon: "token",
    name: "Verify",
    fn: getToken,
  },
  [CodeName.NoInstall]: {
    icon: "install",
    name: "Install",
    fn: installZero,
    callback(res: any) {
      if (res.status == "success") {
        init();
      }
    },
  },
  [CodeName.NoService]: {
    icon: "start",
    name: "Start",
    fn: startService,
    callback(res: any) {
      if (res.status == "success") {
        init();
      }
    },
  },
};

const missionQuery: Ref<missionObject[]> = ref([]);
const missionNoEmpty = computed(() => {
  return !!missionQuery.value.length;
});
//Add
const addmission = (misObj: missionObject | missionObject[]): void => {
  if (!misObj) {
    // misObj = [...misObjDef]
    return;
  }
  if (Array.isArray(misObj)) {
    missionQuery.value = missionQuery.value.concat(
      misObj.map((e) => ({ ...e, key: missionCount++, finish: false }))
    );
  } else {
    missionQuery.value.push({
      ...misObj,
      key: missionCount++,
      finish: false,
    });
  }
  missionStart();
};
//Start
let misssionLock = false;
const missionStart = async () => {
  if (misssionLock) return;
  misssionLock = true;
  let faild = false;
  while (missionNoEmpty.value && !faild) {
    let mi = missionQuery.value[0];
    let res = await mi.fn();
    // sendlog.log(res)
    console.log(res);
    if (res.status == "success") {
      sendlog.log("Task succeeded", mi.name);
      mi.finish = true;
      if (typeof mi.callback == "function") {
        mi.callback(res);
      }
      missionQuery.value.shift();
    } else {
      sendlog.log("Task failed", mi.name);
      //Execution failed, handle preset errors
      faild = true;
      let code = String(res.code);
      if (defaultError[code]) {
        sendlog.log("Error code", code, "calling auto-fix");
        missionQuery.value.unshift({
          ...defaultError[res.code],
          key: missionCount++,
        });
        setTimeout(() => {
          missionStart();
        }, 100);
      } else {
        //Error cannot be automatically resolved, clear tasks
        sendlog.log("Error code", code, "cannot auto-fix");
        mi.finish = true;
        missionQuery.value.forEach((notRunMi) => {
          notRunMi.callback(res);
        });
        missionQuery.value.splice(0);
      }
    }
  }
  misssionLock = false;
};
// const creatMission = (fn: () => Promise<T>): () => Promise<T> => {
//   return addmission(() => fn)
// }
//Get network object by network ID
const getNetworkById = (netId: string) => {
  let net = localJsonData.joinedNetworkList?.find((e) => e.id == netId) || {};
  return net;
};
//Get member by member ID
const getMemberById = (net: userNetwork, id: string): netMember | undefined => {
  return net?.memberList?.find((e) => e.id == id);
};
//ID to name key-value pairs
const nameMap: Ref<Record<string, string>> = computed(() => {
  let map: Record<any, any> = {};
  localJsonData?.joinedNetworkList?.forEach((net) => {
    net?.memberList?.forEach((member: netMember) => {
      let id = member.id as string;
      map[id] = member.name;
    });
  });
  // console.log('nameMap', nameMap)
  return map;
});

// ==============================================================================
// ==                                   Local API Requests                      ==
// ==============================================================================

//Get cache information
const localJsonData: localJsonDataType = reactive({});
const getLocalJsonData = () =>
  window.nodeAPI.readData().then((res: any) => {
    // sendlog.log(res.data)
    Object.keys(res.data).forEach((key) => {
      localJsonData[key] = res.data[key];
    });
    return res;
  });
//Save to local JSON file
const updateLocalJsonData = () => {
  let json = JSON.parse(JSON.stringify(localJsonData));
  // sendlog.log('Save JSON file', json)
  window.nodeAPI.writeData(json);
};
//ZeroTier information
const zerotierStatus: Record<string, any> = reactive({});
let statusRequestCount = 0;
const getZeroTierStatus = () => {
  return new Promise((resolve, reject) => {
    const getStatus = () =>
      window.nodeAPI
        .requestApi({
          url: "status",
          method: "get",
        })
        .then((res) => {
          console.log(res.data);
          if (res.status == "success") {
            Object.keys(res.data).forEach((key) => {
              zerotierStatus[key] = res.data[key];
            });
            // sendlog.log(zerotierStatus)
            cancel();
            resolve(res);
          } else {
            if (++statusRequestCount >= 5) {
              // zerotierStatus.id = 'Null'
              cancel();
              reject();
            }
          }
          return res;
        });
    const { run, data, cancel } = useRequest(getStatus, {
      manual: true,
      pollingInterval: 1000,
    });
    run();
  });
};
//Join network
let errmsg: Record<string, string> = {
  404: "Network not found",
};
//Join and update network
const joinNetwork = (netId: string | number, data: Object) => {
  return new Promise((resolve, reject) => {
    addmission({
      name: "Join",
      icon: "list",
      fn: () =>
        window.nodeAPI.requestApi({
          url: "network/" + netId,
          method: "post",
          data,
        }),
      callback(res: any) {
        if (res.status == "success") {
          //Update local network cache
          updateLoaclNetwork(res.data);
          resolve(res);
        } else {
          window.$message(errmsg[String(res.code)] || "Failed to add network");
          reject(res);
        }
      },
    });
  });
};
//List of currently joined networks
const joinedNetworkList = () =>
  window.nodeAPI
    .requestApi({
      url: "network",
      method: "get",
    })
    .then((res) => {
      sendlog.log("Get list of currently joined networks");
      console.log("List of currently joined networks", res.data);
      if (res.status == "success" && Array.isArray(res.data)) {
        //Update local JSON
        updateLoaclNetwork(res.data);
      }
    });
//Update local network list
const updateLoaclNetwork = (nets: userNetwork | userNetwork[]) => {
  // if (Object.prototype.toString.call(localJsonData.joinedNetworkList) !== '[object Object]') {
  if (!Array.isArray(localJsonData.joinedNetworkList)) {
    localJsonData.joinedNetworkList = reactive([]);
  }
  let arrKeyMap: Record<string, number> = {};
  localJsonData.joinedNetworkList.forEach((n, index) => {
    arrKeyMap[String(n.id)] = index;
  });
  if (Array.isArray(nets)) {
    nets.forEach((n) => {
      let index = arrKeyMap[String(n.id)];
      if (localJsonData.joinedNetworkList) {
        if (index >= 0) {
          Object.assign(localJsonData.joinedNetworkList[index], n);
        } else {
          localJsonData.joinedNetworkList.push(n);
        }
      }
    });
  } else {
    let index = arrKeyMap[String(nets.id)];
    if (index >= 0) {
      Object.assign(localJsonData.joinedNetworkList[index], nets);
    } else {
      localJsonData.joinedNetworkList.push(nets);
    }
  }
  updateLocalJsonData();
  //Check if status needs polling
  netStatusPolling();
};
//Save polling switches
let netStatusPollingMap: Record<string, any> = {};
const SUCCESS_STATUS = "OK"; //Polling stop status
let createPolling = (netId: string) => {
  const netWorkDetail = () =>
    window.nodeAPI
      .requestApi({
        url: "network/" + netId,
        method: "get",
      })
      .then((res) => {
        sendlog.log("Awaiting authorization status polling", "id:" + netId);
        // console.log('Joined network',res.data)
        if (res.data.status === SUCCESS_STATUS) {
          //Update network
          updateLoaclNetwork(res.data);
          cancel();
        } else if (res.code == 404) {
          cancel();
        }
        return res;
      });
  const { run, cancel } = useRequest(netWorkDetail, {
    manual: true,
    pollingInterval: 2000,
  });
  return { run, cancel };
};
//Poll for authorization status
const netStatusPolling = () => {
  let netArr = localJsonData.joinedNetworkList || [];
  netArr.forEach((net) => {
    let { id: netId, status }: { id?: string; status?: string } = net;
    if (!netId) return;
    if (status != SUCCESS_STATUS) {
      if (netStatusPollingMap[netId]) {
        let pollingSwitch = createPolling(netId);
        pollingSwitch.run();
      } else {
        let pollingSwitch = createPolling(netId);
        netStatusPollingMap[netId] = pollingSwitch;
        pollingSwitch.run();
      }
    }
  });
  return;
};
//Leave network
const closeNetwork = (netId: string | number) => {
  return new Promise((resolve, reject) => {
    addmission({
      name: "Disconnect",
      icon: "leave",
      fn: () =>
        window.nodeAPI.requestApi({
          url: "network/" + netId,
          method: "delete",
        }),
      callback(res: any) {
        sendlog.log("Leave network");
        console.log("Leave network", res.data);
        if (res.status == "success") {
          //Update local network cache
          // updateLoaclNetwork(res.data)
          resolve(res);
        } else {
          window.$message(errmsg[String(res.code)] || "Failed to leave network");
          reject(res);
        }
      },
    });
  });
};
//Adjacent node list
const peerList = ref([]);
const getPeerList = () => {
  return new Promise((resolve, reject) => {
    window.nodeAPI
      .requestApi({
        url: "peer",
      })
      .then((res: any) => {
        if ((res.status = res)) {
          sendlog.log("Get adjacent node list");
          console.log("Get adjacent node list", res.data);
          peerList.value = res.data;
          resolve("");
        }
      });
  });
};

// ==============================================================================
// ==                                 Node Service Requests                     ==
// ==============================================================================
//Merge adminId
const assignAdminId = (
  netId: string,
  userId?: string,
  type?: "add" | "red"
) => {
  let net = getNetworkById(netId);
  let adminIds = net?.adminIds || reactive([]);
  if (!userId) {
    return [...adminIds];
  }
  type = type || "add";
  let index = adminIds.findIndex((e) => e == userId);
  if (index < 0) {
    type == "add" ? adminIds.push(userId) : "";
  } else {
    type == "red" ? adminIds.splice(index, 1) : "";
  }
  return [...adminIds];
};
//Set admin ID to network tag
const updateNetTag = (netId: string, tag: any[]) => {
  let net = getNetworkById(netId);
  window.nodeAPI
    .requestApi({
      type: "official",
      url: `network/${netId}`,
      method: "POST",
      data: {
        config: { tags: tag },
      },
      headers: {
        Authorization: net.Authorization,
      },
    })
    .then((res) => {
      console.log("Update tag", res);
    });
};
//Verify network management token
const authAdminToken = (netId: string, token: string) => {
  return new Promise((resolve, reject) => {
    addmission({
      name: "Verify",
      icon: "auth",
      fn: () =>
        window.nodeAPI.requestApi({
          type: "official",
          url: "network",
          method: "get",
          headers: {
            Authorization: "token " + token,
          },
        }),
      callback(res: any) {
        // sendlog.log(res)
        if (res.status == "success") {
          if (Array.isArray(res.data)) {
            let isArr = res.data.map((e: any) => String(e.id));
            if (isArr.includes(netId)) {
              let adminIds = assignAdminId(
                netId,
                String(zerotierStatus.address)
              );
              //Update permission token to local file
              updateLoaclNetwork({
                id: netId,
                Authorization: "token " + token,
                adminIds,
              });
              //Update network extra parameters
              updateNetTag(netId, ["adminIds", adminIds]);
              resolve(res);
              return;
            }
          }
          window.$message(errmsg[String(res.code)] || "Authentication failed");
          reject({
            status: "error",
            code: 0,
            data: "Authentication failed",
          });
        } else {
          window.$message(errmsg[String(res.code)] || "Authentication failed");
          reject(res);
        }
      },
    });
  });
};

//Start administrator functionality for network
const networkAdminServiceSwitch: Record<string, any> = {};
//Reset enabled functionality
const resetNetworkAdminService = (netId: string, service: string) => {
  if (networkAdminServiceSwitch[netId]) {
    if (networkAdminServiceSwitch[netId][service]) {
      networkAdminServiceSwitch[netId][service].cancel();
    }
  } else {
    networkAdminServiceSwitch[netId] = {};
  }
};
//Get network members, sync to other clients
const syncNetworkMember = (netId: string) => {
  let net = getNetworkById(netId);
  let Authorization = net.Authorization;
  if (!Authorization) {
    requestNetworkMember(netId);
    return;
  }

  const updateMember = () =>
    window.nodeAPI
      .requestApi({
        type: "official",
        url: `network/${netId}/member`,
        method: "get",
        headers: {
          Authorization,
        },
      })
      .then((res: any) => {
        // sendlog.log('Admin gets network members',res.data)
        let memberList = res.data.map((mem: any) => {
          let { networkId, nodeId, lastSeen, config, name } = mem;
          let { ipAssignments, authorized, id } = config;
          return {
            id,
            authorized,
            lastSeen,
            nodeId,
            networkId,
            name,
            ip: ipAssignments.join(""),
          };
        });
        let memberIps = memberList
          .map((me: any) => {
            if (zerotierStatus.address != me.id) {
              return me.ip;
            } else {
              return "";
            }
          })
          .filter(
            (item: any) => item !== null && item !== undefined && item !== ""
          );
        sendlog.log("Admin gets network members");
        console.log("Admin gets network members", memberList);
        sendlog.log("Member IPs", memberIps);
        let adminIds = assignAdminId(netId);
        //Update self
        updateLoaclNetwork({
          id: netId,
          memberList,
          adminIds,
        });
        memberListUpdateCount.value++;

        console.log({
          url: "/syncNetworkData",
          memberIps,
          data: {
            originId: zerotierStatus.address, //Initiator
            netId,
            memberList,
            adminIds,
          },
        });
        //Update others
        window.nodeAPI.requestMember({
          url: "/syncNetworkData",
          memberIps,
          data: {
            originId: zerotierStatus.address, //Initiator
            netId,
            memberList,
            adminIds,
          },
        });
        cancel();
        return res;
      })
      .catch((e) => {
        sendlog.log("Error getting network members", e.message);
        cancel();
      });
  //Enable polling
  const { run, cancel } = useRequest(updateMember, {
    manual: true,
    pollingInterval: 1000 * 60 * 10,
  });
  resetNetworkAdminService(netId, "syncNetworkMember");
  networkAdminServiceSwitch[netId]["syncNetworkMember"] = { run, cancel };
  run();
};
//Receive network member data
const memberListUpdateCount = ref(0);
const setSyncNetworkData = (data: any) => {
  let {
    adminIds,
    memberList,
    netId,
  }: { adminIds: string[]; memberList: any[]; netId: string } = data;
  updateLoaclNetwork({
    id: netId,
    memberList,
    adminIds,
  });
  memberListUpdateCount.value++;
};
//Received member request
const getMemberData = (data: any) => {
  let { name, netId, id }: { name: string; netId: string; id: string } = data;
  sendlog.log("Received member data request", name);

  checkMemberName(netId, { id, name }).then(() => {
    syncNetworkMember(netId);
  });
};
//Request network members from administrator
const requestNetworkMember = (netId: string) => {
  let adminIds = assignAdminId(netId);
  // let promiseList: any[] = []
  let net = getNetworkById(netId);
  adminIds.forEach((id) => {
    let mmeber = getMemberById(net, id);
    let ip = mmeber?.ip?.split(",")[0] || "";
    if (!ip) return;
    window.nodeAPI.requestMember({
      url: "/getMemberData",
      memberIps: [ip],
      data: {
        originId: zerotierStatus.address, //Initiator
        netId,
        name: localJsonData.nickname || zerotierStatus.address,
        id: zerotierStatus.address,
      },
    });
  });
};
//Check member nickname
const checkMemberName = (netId: string, member: netMember) =>
  new Promise((resolve, reject) => {
    let net = getNetworkById(netId);
    let memberLocal = getMemberById(net, String(member.id));
    //Nickname mismatch, update nickname
    if (memberLocal && memberLocal.name != member.name) {
      sendlog.log(
        "Nickname mismatch, updating nickname ",
        `id:${member.id} name:${memberLocal.name} -> ${member.name}`
      );
      if (net.Authorization) {
        sendlog.log("I am admin, updating my own nickname");
        updateMemberData(netId, member).finally(() => {
          resolve("");
          syncNetworkMember(String(netId)); //Admin must sync themselves
        });
      } else {
        sendlog.log("Request admin to update nickname");
        requestNetworkMember(netId);
        resolve("");
      }
    } else {
      resolve("");
    }
  });
//Update member information
const updateMemberData = (netId: string, member: netMember) =>
  new Promise((resolve, reject) => {
    let net = getNetworkById(netId);
    window.nodeAPI
      .requestApi({
        type: "official",
        url: `network/${netId}/member/${member.id}`,
        method: "POST",
        data: {
          name: member.name,
        },
        headers: {
          Authorization: net.Authorization,
        },
      })
      .finally(() => {
        resolve("");
      });
  });
//Authorize member
const memberAuthorized = (
  netId: string,
  memberId: string,
  authorized: Boolean
) =>
  new Promise((resolve, reject) => {
    let net = getNetworkById(netId);
    window.nodeAPI
      .requestApi({
        type: "official",
        url: `network/${netId}/member/${memberId}`,
        method: "POST",
        data: {
          config: {
            authorized,
          },
        },
        headers: {
          Authorization: net.Authorization,
        },
      }).then(res=>{
        resolve(res)
      })
      
  });
//Ping a network member
const pingMember = (ip:string)=> new Promise((resolve)=>{
  window.nodeAPI.pingMember(ip).then(res=>{
    // console.log(res.data)
    let showAvg:string = ({
      "0.000": '<1ms',
      "unknown": '--'
    }as Record<string,string>)[res.data.avg] || res.data.avg.replace(/(\d*).(\d*)/,'$1ms')
    resolve(showAvg)
  })
})
//Administrator features
const networkAdminService = () => {
  const service = (net: userNetwork) => {
    syncNetworkMember(String(net.id));
  };
  return new Promise((resolve, reject) => {
    localJsonData.joinedNetworkList?.forEach((net) => {
      if (net.Authorization) {
        service(net);
      }
    });
    resolve("");
  });
};
// ------------------ File Transfer ------------------------ //
const uploadFileList: Ref<uploadFileType[]> = ref([]); //My uploaded file list
const takeFileList: Ref<uploadFileType[]> = ref([]); //My received file list
//File size
const showfileSize = (size: number) => {
  let symbolArr = ["Byte", "KB", "MB", "GB", "TB", "PB"];
  let symbolIndex = 0;
  while (size >= 1024 && symbolIndex < symbolArr.length - 1) {
    size = size / 1024;
    size = Number(size.toFixed(2));
    symbolIndex++;
  }
  return String(size) + symbolArr[symbolIndex];
};
const takeUploadFileInfo = (data: any) => {
  let {
    fileName,
    size,
    originId,
    upLoadId,
  }: { fileName: string; size: number; originId: string; upLoadId: string } =
    data;
  let ori = nameMap.value[originId] || originId;
  let showSize = showfileSize(Number(size));
  sendlog.log(`Received file request from ${ori}`, fileName, showSize);
  takeFileList.value.push({
    fileName: fileName,
    size,
    originId,
    takeId: zerotierStatus.address,
    upLoadId,
  });
};
const uploadFileInfo = ({
  file,
  memberIps,
  originId,
  takeId,
}: {
  file: File;
  memberIps: string[];
  originId: string;
  takeId: string;
}) => {
  let upLoadId = file.name + "-" + file.size + "-" + file.lastModified;
  //Send file information to upload
  window.nodeAPI.requestMember({
    url: "/uploadFileInfo",
    memberIps,
    data: {
      fileName: file.name,
      size: file.size,
      originId,
      upLoadId,
    },
  });
  uploadFileList.value.push({
    fileName: file.name,
    size: file.size,
    originId,
    takeId,
    upLoadId,
  });
};

//Receive node interface data
const onNodeServeData = () =>
  new Promise((resolve, reject) => {
    let requestUrlMap: Record<string, any> = {
      //Receive network member data
      syncNetworkData: setSyncNetworkData,
      //Request network member data
      getMemberData: getMemberData,
      //File transfer request
      takeUploadFileInfo: takeUploadFileInfo,
    };
    //Receive network member list message
    window.nodeAPI.onWebContentsSend((data: any) => {
      // sendlog.log('Vue received network member message', data)
      let { requestUrl, body }: { requestUrl: string; body: any } = data;
      let fn = requestUrlMap[String(requestUrl)];
      fn(body);
    });
    resolve("");
  });
//
// ================================ Initialization Process ================================
let initCount = 0;
const init = () => {
  sendlog.log("Data initialization, count " + ++initCount);
  //Read local file
  //Listen to node interface
  //Get ZeroTier status
  //Check joined networks
  //Check admin permissions
  getLocalJsonData()
    .then(onNodeServeData)
    .then(getToken)
    .then(getZeroTierStatus)
    .then(joinedNetworkList)
    .then(networkAdminService);
};

export default {
  //Add task function
  addmission,
  //Task list response object
  missionQuery,
  missionNoEmpty,
  // creatMission,

  //--
  init,
  localJsonData,
  updateLocalJsonData,
  zerotierStatus,
  joinNetwork,
  closeNetwork,
  updateLoaclNetwork,
  authAdminToken,
  networkAdminService,
  syncNetworkMember,
  requestNetworkMember,
  checkMemberName,
  updateMemberData,
  memberListUpdateCount,
  peerList,
  getPeerList,
  uploadFileInfo,
  uploadFileList,
  takeFileList,
  nameMap,
  showfileSize,
  memberAuthorized,
  pingMember
};
