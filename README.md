# User Info API

## /users/me

### GET

<br />

## /user-info/me

### PUT

유저 정보를 업데이트 한다.  
현재는 이름만 변경 가능하다.  
TODO: 나중에는 아바타(프로필 이미지)도 변경 가능하도록 해야 한다.

body에는 `username`가 들어간다.

```javascript
body: {
  data: {
    username: "NEW_NAME";
  }
}
```

<br />
<br />

# User Room API

## /user-rooms/count

### GET

<br />
<br />

# Leaderboard API

## /leaderboard/room-completion-rankings/`:roomId?`

### GET

<br />
<br />

# Activity API

## /activity/list/`:category?`

### GET

유저 활동 리스트를 호출한다.
**params**으로 `category`를 받는다.  
`category` 값으로는 `platform`, `room`, `user` 이렇게 3가지 지정이 가능하다.  
만약 **`tradeId` 없이 호출한다면 디폴트로 `platform`이 지정** 된다.  
**query**로 `duration`, `limit` 사용 가능하다.

기본호출시 다음과 같은 결과를 보인다.  
 `/activity/list/platform?duration=7&limit=20`

응답 결과는 `type` 값에 따라 구분된다.

```JSON
[
    {
        "id": 1,
        "category": "platform",
        "type": "room_completion",
        "detail": { "order": 6 },
        "createdAt": "2023-10-19T19:22:10.489Z",
        "user": { "id": 45, "username": "디그다" },
        "room": {
            "id": 4,
            "name": "세 친구들의 거실",
            "rid": "three_friends_livingroom"
        },
        "item": null
    },
    {
        "id": 12,
        "category": "platform",
        "type": "newcomer",
        "detail": { "rank": 4 },
        "createdAt": "2023-10-19T19:38:03.238Z",
        "user": { "id": 45, "username": "디그다" },
        "room": null,
        "item": null
    },
     {
        "id": 30,
        "category": "platform",
        "type": "rank_up",
        "detail": { "to": 2, "from": 2 },
        "createdAt": "2023-10-19T19:53:55.686Z",
        "user": { "id": 45, "username": "디그다" },
        "room": null,
        "item": null
    },
    {
        "id": 31,
        "category": "platform",
        "type": "item_#1",
        "detail": {},
        "createdAt": "2023-10-19T19:56:25.044Z",
        "user": { "id": 45, "username": "디그다" },
        "room": null,
        "item": {
            "id": 61,
            "name": "화분",
            "rarity": "uncommon",
            "room": {
                "id": 4,
                "name": "세 친구들의 거실",
                "rid": "three_friends_livingroom"
            }
        }
    },
]
```

<br />
<br />

# Random Item Draw API

## /random-item/`:drawId`

### GET

<br />
<br />

# Daily Quest API

## /daily-quest-progress/today

### GET

<br />

## /daily-quest-progress/verify/`:progressId`

<br />

### GET

<br />

## /daily-quest-progress/claim-rewards/`:progressId`

### GET

<br />
<br />

# Trade API

## /trade-process/owners/`:itemId`

### GET

해당 아이템을 가지고 있는 사람을 찾는다.  
**params**로 `itemId`를 받는다.  
내가 가지고 있지 않은 아이템을 클릭 후 보유자를 확인할 때 호출한다.  
해당 아이템을 많이 가지고 있는 순으로 정렬된다.  
선택한 아이템이 속한 방의 진행도를 알 수 있도록
각 유저마다 보유 아이템을 정보를 같이 내려준다.

#### Response Example

```JSON
[
    {
        "room_id": 4,
        "item_id": 56,
        "count": 7,
        "user_id": 74,
        "username": "김현진",
        "completion_rate": 97
    },
    {
        "room_id": 4,
        "item_id": 56,
        "count": 4,
        "user_id": 71,
        "username": "상호",
        "completion_rate": 100
    },
    {
        "room_id": 4,
        "item_id": 56,
        "count": 4,
        "user_id": 73,
        "username": "doodoji2",
        "completion_rate": 91
    }
]
```

<br />

## /trade-process/non-owners/`:itemId`

### GET

해당 아이템을 가지고 있지 않는 사람들을 찾는다.  
**params**로 `itemId`를 받는다.  
내가 많이 가지고 있는 아이템을 클릭 후 보유하지 않은 사람을 확인할 때 호출한다.  
그 아이템을 적게 가진 순으로 정렬된다.  
위의 API와 동일하게 진행도를 표시할 수 있는 정보를 내려준다.

#### Response Example

```JSON
[
    {
        "room_id": 4,
        "item_id": 48,
        "count": 0,
        "user_id": 70,
        "username": "julia",
        "completion_rate": 3
    },
    {
        "room_id": 4,
        "item_id": 48,
        "count": 0,
        "user_id": 76,
        "username": "두더지",
        "completion_rate": 0
    },
    {
        "room_id": 4,
        "item_id": 48,
        "count": 0,
        "user_id": 75,
        "username": "박현지",
        "completion_rate": 0
    },
    {
        "room_id": 4,
        "item_id": 48,
        "count": 1,
        "user_id": 73,
        "username": "doodoji2",
        "completion_rate": 91
    },
    {
        "room_id": 4,
        "item_id": 48,
        "count": 4,
        "user_id": 71,
        "username": "상호",
        "completion_rate": 100
    },
    {
        "room_id": 4,
        "item_id": 48,
        "count": 9,
        "user_id": 74,
        "username": "김현진",
        "completion_rate": 97
    }
]
```

<br />

## /trade-process/detail/`:roomId`/`:partnerId`

### GET

방 정보와 상대 정보를 보내면 트레이드를 위한 상세 정보를 내려준다.  
**params**로 `roomId`, `partnerId`를 받는다.  
roomId에 해당하는 방에 대한 나와 상대(partner)의 인벤토리 정보를 보여준다.

#### Response Example

```JSON
{
  {
    "all_rooms": [
        {
            "id": 3,
            "name": "냥냥이의 자취방",
            "image_complete": {
                "id": 290,
                "url": "https://storage.googleapis.com/rmnt/complete_meo_2f251bd719/complete_meo_2f251bd719.png"
            }
        },
        {
            "id": 4,
            "name": "세 친구들의 거실",
            "image_complete": {
                "id": 148,
                "url": "https://storage.googleapis.com/rmnt/complete_bd92e77b40/complete_bd92e77b40.png"
            }
        },
        {
            "id": 5,
            "name": "이상징후 사무실",
            "image_complete": {
                "id": 227,
                "url": "https://storage.googleapis.com/rmnt/1_217e1928bc/1_217e1928bc.png"
            }
        },
        {
            "id": 2,
            "name": "가족 거실",
            "image_complete": {
                "id": 81,
                "url": "https://storage.googleapis.com/rmnt/complete_1f86ce4b42/complete_1f86ce4b42.png"
            }
        },
        {
            "id": 1,
            "name": "저니의 풍선집",
            "image_complete": {
                "id": 226,
                "url": "https://storage.googleapis.com/rmnt/complete_5068c650ee/complete_5068c650ee.png"
            }
        }
    ],
    "me": [
        {
            "id": 1815,
            "serial_number": 5,
            "item": {
                "id": 140,
                "name": "바람 구멍 밴드",
                "desc": "저 밴드를 빼면 집이 쪼그라들 수도 있답니다.",
                "rarity": "common",
                "category": "decoration",
                "attribute": {
                    "size": [
                        42,
                        42
                    ],
                    "z_index": 0,
                    "position": [
                        99,
                        1032
                    ],
                    "pre_items": [],
                    "addtional_attributes": []
                },
                "image": {
                    "id": 332,
                    "url": "https://storage.googleapis.com/rmnt/_b1001ca878/_b1001ca878.png"
                },
                "thumbnail": {
                    "id": 369,
                    "url": "https://storage.googleapis.com/rmnt/_0e3a4ad864/_0e3a4ad864.png"
                },
                "additional_images": null
            }
        },
        {
            "id": 1230,
            "serial_number": 5,
            "item": {
                "id": 150,
                "name": "어디로갈까 지구본",
                "desc": "저니의 풍선을 타고 어디로 가볼까요?🎈",
                "rarity": "uncommon",
                "category": "decoration",
                "attribute": {
                    "size": [
                        104,
                        125
                    ],
                    "z_index": 1,
                    "position": [
                        866,
                        778
                    ],
                    "pre_items": [],
                    "addtional_attributes": []
                },
                "image": {
                    "id": 345,
                    "url": "https://storage.googleapis.com/rmnt/_ff4ced96ea/_ff4ced96ea.png"
                },
                "thumbnail": {
                    "id": 380,
                    "url": "https://storage.googleapis.com/rmnt/_3f8c18fe32/_3f8c18fe32.png"
                },
                "additional_images": null
            }
        }
    ],
    "partner": [
        {
            "id": 1625,
            "serial_number": 11,
            "item": {
                "id": 145,
                "name": "식탁",
                "desc": "밥은 식탁에서 먹게 식탁을 놔주세요~",
                "rarity": "common",
                "category": "decoration",
                "attribute": {
                    "size": [
                        219,
                        160
                    ],
                    "z_index": 0,
                    "position": [
                        1007,
                        1135
                    ],
                    "pre_items": [],
                    "addtional_attributes": []
                },
                "image": {
                    "id": 338,
                    "url": "https://storage.googleapis.com/rmnt/_d02259ca61/_d02259ca61.png"
                },
                "thumbnail": {
                    "id": 372,
                    "url": "https://storage.googleapis.com/rmnt/_1f6eea6918/_1f6eea6918.png"
                },
                "additional_images": null
            }
        }
    ]
}

```

<br />

## /trade-process/proposal

### POST

트레이드를 생성한다.  
참여자들은 <u>반드시 1개 이상의 아이템을 제시</u>하여야 한다.  
빈 배열 입력시 트레이드는 생성되지 않는다.

body에는 `partnerId`, `proposerItems`, `partnerItems`가 들어간다.

```javascript
body: {
  data: {
    partnerId: 2,             // userId
    proposerItems: [1, 2, 3], // inventoryId[]
    partnerItems: [4, 5, 6]   // inventoryId[]
  }
}
```

#### Related Error Code

- `1004`: _INVALID_TRADE_ITEMS_
- `1005`: _DAILY_TRADE_LIMIT_EXCEEDED_
- `1006`: _PROPOSER_ITEMS_NOT_FOUND_
- `1007`: _PARTNER_ITEMS_NOT_FOUND_

<br />

## /trade-process/counter-proposal/`:tradeId`

### PUT

트레이드를 받은 **partner**가 역제안 할 때 호출한다.  
**params**로 `tradeId`를 받는다.  
**proposer**는 <u>역제안 할 수 없다.</u>  
**body**에는 `proposerItems`, `partnerItems`가 들어간다.

```javascript
body: {
  data: {
    proposerItems: [1, 2, 3], // inventoryId[]
    partnerItems: [4, 5, 6]   // inventoryId[]
  }
}
```

#### Related Error Code

- `1001`: _TRADE_EXPIRED_
- `1003`: _INVALID_TRADE_STATUS_
- `1004`: _INVALID_TRADE_ITEMS_
- `1006`: _PROPOSER_ITEMS_NOT_FOUND_
- `1007`: _PARTNER_ITEMS_NOT_FOUND_
- `1008`: _ONLY_PARTNER_CAN_COUNTER_PROPOSE_

<br />

## /trade-process/accept/`:tradeId`

### PUT

트레이드를 수락할 때 호출한다.  
**params**으로 `tradeId`를 받는다.  
트레이드의 `status`가 `proposed` 혹은 `counter_proposed` 일 경우에만 정상 응답한다.(그 외에는 **400**)  
트레이드 참여자들의 아이템 소유 여부를 확인하고 정상적인 조건이라면 트레이드를 진행한다.  
만약 둘 중 하나라도 아이템 소유권에 문제가 있다면 `status`는 `failed`로 변경되며 해당 트레이드는 종료된다.  
트레이드가 유효하다면 서로 제시한 인벤토리 아이템의 소유권을 각자에게 넘겨준다.  
트레이드가 성공하면 `status`를 `success`로 변경한다.

#### Related Error Code

- `1001`: _TRADE_EXPIRED_
- `1003`: _INVALID_TRADE_STATUS_
- `1006`: _PROPOSER_ITEMS_NOT_FOUND_
- `1007`: _PARTNER_ITEMS_NOT_FOUND_
- `1009`: _NOT_PARTICIPANT_
- `1010`: _ONLY_PARTNER_CAN_ACCEPT_PROPOSAL_
- `1011`: _ONLY_PROPOSER_CAN_ACCEPT_COUNTER_PROPOSAL_

<br />

## /trade-process/cancel/`:tradeId`

### PUT

트레이드를 취소할 때 호출한다.  
**params**으로 `tradeId`를 받는다.

- 만약 트레이드의 `status`가 `proposed` 상태라면

  - **proposer**가 취소할 경우에는 `status`는 `canceled`로 변경
  - **partner**가 취소할 경우에는 `status`는 `rejected`로 변경

- 만약 트레이드의 `status`가 `counter_proposed` 상태라면
  - **proposer**가 취소할 경우에는 `status`는 `rejected`로 변경
  - **partner**가 취소할 경우에는 `status`는 `canceled`로 변경

취소된 거래라도 일일 거래 횟수에 포함된다.

#### Related Error Code

- `1001`: _TRADE_EXPIRED_
- `1003`: _INVALID_TRADE_STATUS_
- `1009`: _NOT_PARTICIPANT_

<br />

## /trade-process/trades

### GET

트레이드 리스트  
현재 내가 참여하고 있는 트레이드 리스트를 보여준다.  
트레이드 확인 페이지에서 호출한다.
**proposer** 혹은 **partner**가 되는 경우 모두 포함된다.

    TODO:
    - 트레이드 만료 시간순으로 정렬할 것인지, 아니면 업데이트된 순서로 정렬할 것인지 정해야 함.
    - 과겨 이력을 모두 보여줄 수는 없으므로 만료된 트레이드는 보여주지 않는 방향으로 쿼리해야 하는지도 고민해야 함.

<br />

## /trade-process/trades/`:tradeId`

### GET

트레이드 상세
**params**으로 `tradeId`를 받는다.  
현재 내가 참여하고 있는 트레이드 상세 보여준다.  
트레이드 확인 페이지에서 리스트를 클릭하면 호출한다.

#### Response Example

```JSON
{
    "id": 6,
    "expires": "2023-09-28T01:39:23.508Z",
    "createdAt": "2023-09-26T01:39:24.345Z",
    "updatedAt": "2023-09-28T04:15:20.468Z",
    "publishedAt": "2023-09-26T01:39:23.508Z",
    "status": "expired",
    "proposer_read": true,
    "partner_read": false,
    "proposer": {
        "id": 73,
        "username": "doodoji2"
    },
    "proposer_items": [
        {
            "id": 369,
            "serial_number": 4,
            "item": {
                "id": 70,
                "name": "거미",
                "rarity": "common",
                "thumbnail": {
                    "id": 194,
                    "url": "https://storage.googleapis.com/rmnt/_9f45b6c486/_9f45b6c486.png"
                },
                "room": {
                    "id": 5,
                    "name": "이상징후 사무실"
                }
            }
        }
    ],
    "partner": {
        "id": 71,
        "username": "상호"
    },
    "partner_items": [
        {
            "id": 206,
            "serial_number": 2,
            "placed_in_room": false,
            "createdAt": "2023-09-09T13:19:22.473Z",
            "updatedAt": "2023-09-26T09:58:30.211Z",
            "publishedAt": "2023-09-09T13:19:22.470Z",
            "status": null,
            "item": {
                "id": 99,
                "name": "탄생석",
                "rarity": "uncommon",
                "thumbnail": {
                    "id": 222,
                    "url": "https://storage.googleapis.com/rmnt/_139a0fc9b9/_139a0fc9b9.png"
                },
                "room": {
                    "id": 5,
                    "name": "이상징후 사무실"
                }
            }
        }
    ]
}
```

<br />

## /trade-process/status/`:tradeId?`

### PUT

트레이드 상태 읽음 처리  
트레이드 확인 페이지에서 호출한다.  
**params**으로 `tradeId`를 받는다.  
만약 **`tradeId` 없이 호출한다면 모든 트레이드를 읽음 처리**한다.

<br />
<br />

# Inventory Managing API

## /inventory-manager/sell

### PUT

아이템을 판매한다.

body의 `data`에는 `Inventory ID`의 배열이 들어간다.

```javascript
body: {
  data: [457, 458, 462];
}
```

#### Related Error Code

- `2001`: _INVALID_ITEMS_STATUS_
- `2002`: _ITEM_NOT_OWNED_

<br />

## /inventory-manager/sell/item

### PUT

아이템을 판매한다.

body의 `data`에는 `key-value` 객체가 들어가며 `key` 값으로는 `Item ID`, `value` 값으로는 판매하려는 갯수를 입력한다.

```javascript
body: {
  data: {"79":3,"274":2}
}
```

#### Related Error Code

- `2003`: _NON_NUMERIC_INPUT_
- `2004`: _NOT_ENOUGH_ITEMS_

<br />
<br />

# User Room API

## /user-room/initial-completion-check/`:roomId?`

### GET

최초 완성 체크된 방의 정보만 배열로 내려온다.

`:roomId`를 넣지 않으면 내가 가진 전체 방에 대한 완성 여부를 내려준다.  
첫 완료에 해당하는 방이 없으면 빈 배열(`[]`)을 응답한다.

#### Response Example

```JSONC
// roomId를 입력하지 않은 경우 복수의 결과가 나올 수 있다.
[
    {
        "id": 4,
        "name": "세 친구들의 거실",
        "rid": "three_friends_livingroom",
        "image_complete": "https://storage.googleapis.com/rmnt/complete_bd92e77b40/complete_bd92e77b40.png"
    },
    {
        "id": 3,
        "name": "냥냥이의 자취방",
        "rid": "meo_home",
        "image_complete": "https://storage.googleapis.com/rmnt/complete_meo_2f251bd719/complete_meo_2f251bd719.png"
    }
]

// 결과가 없는 경우
[]
```
