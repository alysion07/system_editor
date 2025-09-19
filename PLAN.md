# MARS 전처리 GUI 설계 스펙 (SMART.i 기준)

## 1. 목적
- SMART.i 입력 덱을 기준으로 실제 사용된 계통과 파라미터를 정리.
- 웹 기반 전처리기(React Flow 기반)에서 **노드 생성/명명 규칙**과 **연결선 규칙**을 명확히 정의.
- 사용자는 그래픽 UI에서 노드와 연결선만 조작.
- 시스템은 MARS 입력 형식(CCC 카드 구조, from/to, 파라미터)을 자동 생성.

---

## 2. 컴포넌트 종류 (SMART.i 기준)

SMART.i에서 확인된 주요 계통(컴포넌트 타입):

- **snglvol**: 단일 체적
- **pipe**: 1D 파이프
- **sngljun**: 단일 접합
- **mtpljun**: 다중 접합
- **branch**: 분기
- **pump**: 펌프
- **valve**: 밸브 (트립 연동)
- **prizer**: 가압기
- **sg**: 증기발생기 (1차·2차)
- **separator/dryer**: 증기 분리기/건조기
- **accumulator**: 축압기
- **eccmixer**: ECC 혼합기
- **circltr**: 보조계통 순환기
- **tmdpvol / tmdpjun**: 시간의존 체적/접합

---

## 3. 컴포넌트 파라미터 (요약)

### 공통 입력
- **geometry**: x-area, x-length, volume, angle, dz, x-wall, xhd
- **junction**: from/to, area, forward loss, reverse loss
- **flags**: jefvcahs (junction control flags)
- **initial condition**: ebt, press, temp, flow, mfl, mfv

### 주요 플래그(jefvcahs)

- `e`: PV term
- `f`: CCFL
- `v`: stratification
- `c`: choking
- `a`: 면적 변화 모델 (0=smooth, 1=full abrupt, 2=partial abrupt)
- `h`: homogeneity
- `s`: momentum flux

### 특수 계통

- **Pump**: inlet/outlet junction, 초기유량, 특성곡선(H-Q, B-Q, etc.)
- **Valve**: open %, Cv, fail position, trip 연동 로직
- **ECC Mixer**: 주입·정상입구·출구 3점 연결 필수
- **Accumulator**: 초기 압력, 보론 농도, 분사 조건

---

## 4. 노드 명명 규칙

- **내부 ID**: UUID (React Flow 관리용)
- **표시명**: `SYS-KIND-idx` (예: `PRI-PIPE-12`)
- **내부 번호(CCC)**: 자동 할당, 사용자 편집 불가
    - Primary: 100–199
    - Secondary: 200–299
    - Auxiliary: 300–399
    - Control: 400–499
    - 오프셋: pipe:+0, sngljun:+10, mtpljun:+20, pump:+80, valve:+90 …
- **익스포트 시**: `CCC0000 <name> <type>` 형태로 출력

---

## 5. 연결선 규칙

### 5.1 from/to 코드

- 형식: `CCCVV000N`
    - `CCC`: 컴포넌트 번호
    - `VV`: 체적 번호(볼륨/셀 index)
    - `N`: 면 번호 (1=in, 2=out, 3~6=crossflow)

### 5.2 방향성

- **원칙**: `out → in`만 허용
- **특례**: ECC mixer 등 다중 입력 구조 허용
- **phase**: liquid ↔ liquid, gas ↔ gas, mix→liquid/gas 허용
- **capacity**: 포트별 연결 제한 (예: inlet=1, outlet=다중 가능)

### 5.3 Junction 규칙

- **sngljun**: from/to 필수, area, kfor, krev, jefvcahs 입력
- **mtpljun**: no of jun, 각 분기별 from/to/area/loss/flags 필요
- **branch**: njuns 지정, 각 분기별 from/to 지정

### 5.4 Pump 연결

- 반드시 inlet·outlet 존재
- from=흡입측, to=토출측
- 손실계수, jefvcahs 입력
- pump curve 반드시 존재

### 5.5 Valve 연결

- from/to 지정
- 개폐 특성 (open%, Cv, failPos)
- trip logic 연동 (`cntrlvar`, `timeof` 등)

### 5.6 ECC Mixer

- 3 junction mandatory: ECC 주입, 정상입구, 정상출구
- 각 포트 지정 (CCC010001=in, CCC010002=out)

---

## 6. 검증 규칙

- **번호 충돌**: CCC 고유해야 함
- **포트 충돌**: `(CCC,VV,N)` 중복 불가
- **방향**: out→in 이외 금지
- **phase mismatch**: 불가 (예: liquid→gas)
- **capacity 초과**: 연결 제한 초과 시 금지
- **금지 조합**: 매뉴얼 정의 (예: accumulator→separator 직접연결 금지)

---

## 7. 데이터 스키마 (요약)

```ts
type Node = {
    id: UUID;
    kind: 'pipe' | 'sngljun' | 'mtpljun' | 'pump' | 'valve' |...;
    sys: 'pri' | 'sec' | 'aux' | 'ctrl';
    name: string;
    ccc?: number; // 익스포트 시 부여 
    ports: Port[];
    meta: { ... }; // geom, flags, init cond. 
};  
 
 type Edge = {
     id: UUID;
     source: UUID;
     sourcePortId: PortId;
     target: UUID;
     targetPortId: PortId;
     mars: {
         type: 'sngljun' | 'mtpljun' | 'pump' | 'valve' |...;
         from?: number; // CCCVV000N (익스포트 시)     
         to?: number;
         area?: number;
         kfor?: number;
         krev?: number;
         flags?: string;
     };
 };
```

---

## 8. 익스포트 규칙

- **노드** → `CCC0000 name type` + 세부 geometry/initial condition 카드 출력
- **엣지** → `CCC01NN from to area kfor krev flags` 형식으로 출력
- **자동 변환**: UUID/포트 → CCCVV000N 변환

---

## 9. UI/UX 지침

- 노드 생성 시 번호 자동 할당, 사용자는 명칭만 확인
- 연결선 드래그 시: 유효 포트만 하이라이트, 불가 사유 툴팁
- 연결 직후 팝오버: area, kfor, krev, flags 입력 가능
- 저장 전 전역 검증: 번호 충돌, 고아 포트, phase mismatch 리포트

---
# ✅ 결론
- SMART.i 에서 사용된 계통과 파라미터를 기준으로 **노드/엣지 스키마, 명명 규칙, 연결 규칙, 검증 규칙**을 정리
- 이 문서는 **웹 기반 전처리기 개발의 기초 설계 스펙**으로 활용 가능
- 사용자는 노드/엣지만 다루고, 시스템이 MARS 입력 형식과 규칙을 자동으로 보장한다.

---

# 카드 슬롯 매핑 표

## 공통 키

- `CCC0000`: `<name> <type>`
- `phase`: `liquid|gas|mix|ctrl`
- `flags.jefvcahs`: 접합 플래그 문자열
- `loss.k_for|k_rev`: 방향별 손실계수
- `ic.*`: 초기조건(압력, 온도, 유량 등)

---

## snglvol

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=snglvol`|헤더|
|`CCC0101`|`geom.area,len,vol`|체적 기하|
|`CCC0102`|`geom.az,geom.inc,geom.dz`|방향·고도|
|`CCC0103`|`rough,xhd`|거칠기·수력직경|
|`CCC0200`|`ic.ebt,ic.press,ic.temp`|초기조건|

---

## pipe

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=pipe`|헤더|
|`CCC0001`|`cells`|셀 수|
|`CCC01[01..cells]`|`x.area[i]`|단면적(셀별)|
|`CCC02[01..cells]`|`x.len[i]`|길이|
|`CCC03[01..cells]`|`x.vol[i]`|체적|
|`CCC04[01..cells]`|`x.az[i],x.inc[i],x.dz[i]`|방향·고도|
|`CCC05[01..cells]`|`x.rough[i],x.hd[i]`|거칠기·직경|
|`CCC09[01..njun]`|`jun.loss_f,loss_r,jun.id`|접합 손실(세그먼트 경계)|
|`CCC10[01..cells]`|`x.flags[i], volId[i]`|볼륨 플래그|
|`CCC11[01..njun]`|`jun.flags, jun.num`|접합 플래그|
|`CCC12[01..cells]`|`ic.ebt,ic.press,ic.temp, volId[i]`|초기조건|
|`CCC13[01..njun]`|`flow.opt,mfl,mfv,jun.id`|유량 초기값|

---

## sngljun

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=sngljun`|헤더|
|`CCC0101`|`from,to,area`|`CCCVV000N` → `CCCVV000N`|
|`CCC0102`|`loss.k_for,loss.k_rev,flags.jefvcahs`|손실/플래그|
|`CCC0201`|`flow.opt,mfl,mfv`|초기 유량|

---

## mtpljun

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=mtpljun`|헤더|
|`CCC0001`|`n_jun, icond`|분기 수|
|`CCC01x1`×n|`from,to,area`|각 분기 x=분기 index|
|`CCC01x2`×n|`k_for,k_rev,flags,dischg,thermal`|손실·초킹|
|`CCC01x3`×n|`f_incre,t_incre,idx`|증가량·타임스텝|
|`CCC10x1`×n|`mfl,mfv,idx`|유량 초기값|

---

## branch

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=branch`|헤더|
|`CCC0001`|`n_juns`|분기 수|
|`CCC01x1`×n|`from,to,area`|분기|
|`CCC01x2`×n|`k_for,k_rev,flags`|손실·플래그|
|`CCC02x1`×n|`mfl,mfv`|유량 초기값|

---

## pump

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=pump`|헤더|
|`CCC0101`|`geom.area,len,vol`|기하|
|`CCC0102`|`geom.az,geom.inc,geom.dz`|방향·고도|
|`CCC0108`|`from,to,area`|흡입↔토출|
|`CCC0109`|`loss.k_for,loss.k_rev,flags.jefvcahs`|손실·플래그|
|`CCC0200`|`ic.press,ic.temp`|초기조건|
|`CCC0201`|`flow.opt,mfl,mfv`|유량 초기값|
|`CCC11[01..m]`|`curve.HQ[i]`|H-Q 테이블|
|`CCC12[01..m]`|`curve.BQ[i]`|B-Q(토크)|

---

## valve

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=valve`|헤더|
|`CCC0101`|`from,to,area`|연결|
|`CCC0102`|`k_for,k_rev,flags.jefvcahs`|손실·플래그|
|`CCC0201`|`open_pct,Cv,fail_pos`|밸브 특성|
|`CCC0301`|`ctrl.link,trip.ref`|트립 연동|

---

## prizer (pressurizer)

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=prizer`|헤더|
|`CCC0001`|`n_vol`|체적 수|
|`CCC0101..`|`vol.area,len,vol`|체적 기하|
|`CCC0200`|`ic.press,ic.temp,level`|초기조건|
|`CCC0301`|`htc.liq_vap,user`|열전달|
|`CCC0401`|`spray.d, nozzle..`|스프레이|

---

## sg (steam generator) + separator/dryer

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=sg`|헤더|
|`CCC0101..`|`pri.tube/annulus geom`|1차측|
|`CCC0201..`|`sec.downcomer/dome`|2차측|
|`CCC0301`|`sep.eff`|분리기|
|`CCC0302`|`dryer.eff`|건조기|
|`CCC0401..`|`HT surface`|전열|
|`CCC0500`|`ic.press,temp,level`|초기조건|

---

## accumulator

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=accumulator`|헤더|
|`CCC0101`|`geom.*`|기하|
|`CCC0200`|`p0, boron, temp`|초기조건|
|`CCC0108`|`from,to,area`|분사 라인|
|`CCC0109`|`loss.k_for,k_rev,flags`|손실·플래그|

---

## eccmixer

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=eccmixer`|헤더|
|`CCC0001`|`n_ports=3`|주입·정상입구·출구|
|`CCC0101..0103`|`from,to,area`|각 포트|
|`CCC0104`|`k_for,k_rev,flags`|공통 손실|
|`CCC0201`|`inj.angle, mix.coeff`|혼합 특성|

---

## tmdpvol / tmdpjun

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=tmdpvol`|헤더|
|`CCC0101`|`tbl.press/temp/void`|시간의존 테이블|
|`CCC0000`|`name,type=tmdpjun`|헤더|
|`CCC0101`|`from,to,area`|경계 접합|
|`CCC0102`|`tbl.flow/vel`|시간의존 유량|

---

## circltr

|슬롯|필드|설명|
|---|---|---|
|`CCC0000`|`name,type=circltr`|헤더|
|`CCC0101`|`from,to,area`|연결|
|`CCC0102`|`k_for,k_rev,flags`|손실·플래그|
|`CCC0201`|`qv.set`|순환 유량|

---

# 구현 지침

## 생성·검증
- **생성**: 타입 선택 → 노드 생성 → 포트 자동 배치 → `CCC` 자동 채번.
- **연결**: 엣지 드래그 → `from/to`는 익스포트 시 `encode(CCC,VV,N)`.
- **검증**:
  - out→in, phase 일치, capacity 제한.
    - 슬롯 필수성: 표에 정의된 **필수 슬롯** 누락 시 에러.
    - `loss`, `flags` 기본값 주입 가능하나 저장 전 사용자 확인 요구.

## 익스포트
- 노드별: 헤더(`CCC0000`) → 표의 슬롯 순서대로 라인 생성.
- 엣지별: 연결형 슬롯(`0101`,`0102` 등)에 from/to와 손실·플래그 반영.
- 테이블형 곡선(H-Q 등): 행 수 자동 집계하여 연속 슬롯로 출력.

## 설계 포인트
- 슬롯 번호는 **버전 차**가 존재할 수 있으므로, 상단 표를 **JSON 스키마**로 분리해 로더로 주입.
- 예: `mars_schema.json`에 `type → [ {slot:"0101", key:"from,to,area", required:true}, ... ]`.