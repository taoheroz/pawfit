import './styles.css';
import { BUNDLED_IMAGES } from './generated/images.js';
import { setupPWA, isIOS, isInstalled } from './pwa.js';

/* ================= data ================= */
const FOODS=[
['ข้าวกะเพราหมูสับไข่ดาว',630,27,65,28,'dish'],['ข้าวกะเพราไก่ (ไม่ใส่ไข่)',500,25,60,16,'dish'],['ข้าวผัดหมู',560,18,75,20,'dish'],
['ผัดไทยกุ้งสด',600,20,80,22,'dish'],['ข้าวมันไก่',600,25,70,22,'dish'],['ข้าวไข่เจียว',560,16,50,32,'dish'],
['ก๋วยเตี๋ยวเส้นเล็กน้ำใสหมู',330,18,45,8,'dish'],['ก๋วยเตี๋ยวต้มยำ',400,18,50,14,'dish'],['เกาเหลาหมู',220,22,6,12,'dish'],
['สุกี้น้ำไก่',350,25,35,10,'dish','veg'],['ผัดซีอิ๊วหมู',650,20,85,25,'dish'],['ราดหน้าหมู',560,20,75,18,'dish','veg'],
['โจ๊กหมูใส่ไข่',300,16,40,8,'dish'],['ข้าวต้มปลา',280,20,35,5,'dish'],['แกงเขียวหวานไก่ + ข้าว',640,24,65,30,'dish'],
['สลัดอกไก่',250,28,12,10,'dish','veg'],['สเต็กอกไก่',350,40,15,14,'dish'],
['ส้มตำไทย',120,4,24,1,'side','veg'],['ไก่ย่าง 1 น่อง',200,22,2,12,'side'],['ลาบหมู',230,20,8,13,'side','veg'],
['ยำวุ้นเส้นทะเล',220,18,26,5,'side','veg'],['ต้มยำกุ้งน้ำใส',150,18,8,5,'side'],['แกงจืดเต้าหู้หมูสับ',180,16,6,10,'side','veg'],
['ผัดผักรวม',150,4,12,10,'side','veg'],['ปลาทูนึ่ง + น้ำพริก',250,24,4,14,'side','veg'],['หมูปิ้ง 3 ไม้',300,18,12,20,'side'],
['ข้าวสวย 1 ทัพพี',120,2,27,0,'side'],['ข้าวกล้อง 1 ทัพพี',110,3,23,1,'side'],['ข้าวเหนียว 1 ห่อ',230,4,50,0,'side'],
['อกไก่นุ่ม 1 ซอง',110,23,2,1.5,'cvs'],['ไข่ต้ม 2 ฟอง',150,13,1,10,'cvs'],['ข้าวกล่องกะเพราไก่',420,18,60,12,'cvs'],
['แซนด์วิชทูน่า',280,14,30,11,'cvs'],['ซาลาเปาหมูสับ',230,9,36,6,'cvs'],['โยเกิร์ตกรีก 1 ถ้วย',100,10,8,3,'cvs'],
['นมจืดไขมันต่ำ 200 มล.',100,7,10,3,'drink'],['นมถั่วเหลืองหวานน้อย',110,7,12,4,'drink'],['เวย์โปรตีน 1 สกู๊ป',120,24,3,1.5,'drink'],
['ขนมปังโฮลวีท 1 แผ่น',80,4,14,1,'snack'],['กล้วยหอม 1 ลูก',105,1,27,0,'snack'],['แอปเปิล 1 ลูก',95,0.5,25,0,'snack'],
['ส้ม 1 ลูก',60,1,15,0,'snack'],['อัลมอนด์ 1 กำมือ',165,6,6,14,'snack'],['ไข่ขาว 3 ฟอง',50,11,1,0,'snack'],
['อเมริกาโน่ไม่หวาน',10,0,2,0,'drink'],['กาแฟเย็น',300,4,45,11,'drink','sweet'],['ชาไทยเย็น',350,3,55,12,'drink','sweet'],
['ชานมไข่มุก',450,3,80,12,'drink','sweet'],['น้ำอัดลม 1 กระป๋อง',140,0,35,0,'drink','sweet']
].map((a,i)=>({id:'f'+i,name:a[0],kcal:a[1],p:a[2],c:a[3],f:a[4],cat:a[5],tags:a[6]?[a[6]]:[]}));
/* ---------- illustrations ----------
   IMG lists the AI illustration files that have been added (img/<key>.png).
   Any key not listed falls back to the hand-drawn SVG below, so new images can be dropped in one at a time. */
const IMG=new Set(BUNDLED_IMAGES);          /* bundled files in img/ (used by the real app build) */
const IMGURL={};                  /* images the user uploaded on this device (IndexedDB) */
const imgSrc=k=>k&&(IMGURL[k]||(IMG.has(k)?`${import.meta.env.BASE_URL}img/${k}.webp`:null));
const IDB={db:null,
  open(){return new Promise(res=>{try{const r=indexedDB.open('pawfit-img',1);r.onupgradeneeded=()=>r.result.createObjectStore('imgs');r.onsuccess=()=>{this.db=r.result;res(this.db)};r.onerror=()=>res(null)}catch(e){res(null)}})},
  async all(){const db=this.db||await this.open();if(!db)return{};return new Promise(res=>{const out={};try{const rq=db.transaction('imgs').objectStore('imgs').openCursor();rq.onsuccess=()=>{const c=rq.result;if(c){out[c.key]=c.value;c.continue()}else res(out)};rq.onerror=()=>res(out)}catch(e){res(out)}})},
  async put(k,b){const db=this.db||await this.open();if(!db)throw new Error('no db');return new Promise((res,rej)=>{const tx=db.transaction('imgs','readwrite');tx.objectStore('imgs').put(b,k);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})},
  async del(k){const db=this.db||await this.open();if(!db)return;return new Promise(res=>{const tx=db.transaction('imgs','readwrite');tx.objectStore('imgs').delete(k);tx.oncomplete=res;tx.onerror=res})}};
function setImgURL(k,blob){if(IMGURL[k])try{URL.revokeObjectURL(IMGURL[k])}catch(e){}; if(blob)IMGURL[k]=URL.createObjectURL(blob); else delete IMGURL[k]}
async function loadImgs(){const all=await IDB.all();Object.entries(all).forEach(([k,b])=>{try{setImgURL(k,b)}catch(e){}})}
const ART_KEYS=['food_kaprao','food_kaprao','food_friedrice','food_padthai','food_khaomankai','food_omelet_rice','food_noodle_clear','food_tomyum_noodle','food_clear_soup','food_suki',
 'food_stirfry_noodle','food_stirfry_noodle','food_congee','food_congee','food_green_curry','food_salad_chicken','food_chicken_steak','food_somtam','food_grilled_chicken','food_larb',
 'food_glass_noodle_salad','food_tomyum_soup','food_clear_soup','food_stirfry_veg','food_mackerel','food_moo_ping','food_rice','food_brown_rice','food_sticky_rice','cvs_chicken_breast',
 'food_boiled_egg','cvs_bento','cvs_sandwich','cvs_bun','cvs_yogurt','drink_milk','drink_soymilk','drink_protein','snack_bread','snack_banana',
 'snack_apple','snack_orange','snack_almonds','snack_egg_white','drink_americano','drink_coffee','drink_thaitea','drink_bubbletea','drink_soda'];
FOODS.forEach((f,i)=>f.art=ART_KEYS[i]);
const O='#6B4A33', SW=`stroke="${O}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`, SW2=`stroke="${O}" stroke-width="1.6" stroke-linejoin="round"`;
const fFace=(x=32,y=50)=>`<circle cx="${x-5}" cy="${y}" r="1.7" fill="${O}"/><circle cx="${x+5}" cy="${y}" r="1.7" fill="${O}"/><path d="M${x-2} ${y+2.4}q2 2 4 0" stroke="${O}" stroke-width="1.5" fill="none" stroke-linecap="round"/><ellipse cx="${x-8.5}" cy="${y+2}" rx="2.4" ry="1.4" fill="#F49A9A" opacity=".7"/><ellipse cx="${x+8.5}" cy="${y+2}" rx="2.4" ry="1.4" fill="#F49A9A" opacity=".7"/>`;
const leafA=(x,y,r=-25,c='#5BAA5B')=>`<ellipse cx="${x}" cy="${y}" rx="3.4" ry="1.9" transform="rotate(${r} ${x} ${y})" fill="${c}" ${SW2}/>`;
const ballA=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${SW2}/>`;
const eggA=(x,y)=>`<path d="M${x-9} ${y}q1-7 9-7q9 0 9 6q0 7-9 7q-9 0-9-6z" fill="#fff" ${SW}/><circle cx="${x}" cy="${y-.5}" r="3.6" fill="#F7C548" ${SW2}/>`;
const shrimpA=(x,y)=>`<path d="M${x} ${y}q3-6 8-2" stroke="#F08A6E" stroke-width="4" fill="none" stroke-linecap="round"/>`;
const noodlesA=c=>`<path d="M13 29q5 3 10 0t10 0t10 0t9 0M15 32.5q5 3 10 0t10 0t10 0" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
const plateA=c=>`<g transform="translate(32 34) scale(1.12) translate(-32 -40)"><ellipse cx="32" cy="42" rx="28" ry="13" fill="#FFFFFF" ${SW}/><ellipse cx="32" cy="40" rx="21" ry="8.5" fill="#F1EEE6"/>${c}${fFace(32,49.5)}</g>`;
const riceA=(c='#FFFFFF')=>`<path d="M14 40q18-24 36 0q-18 6-36 0z" fill="${c}" ${SW}/><path d="M22 33l2-1M30 29l2 0M38 32l2 1M27 36l2-1" stroke="#E2DACB" stroke-width="1.6" stroke-linecap="round"/>`;
const pileA=c=>`<path d="M15 40q17-22 34 0q-17 6-34 0z" fill="${c}" ${SW}/>`;
const bowlA=(broth,items,fill='#FFFFFF')=>`<path d="M6 30h52q-1 25-26 25T6 30z" fill="${fill}" ${SW}/><path d="M12 40q20 6 40 0" stroke="#9FC9E8" stroke-width="2" fill="none" opacity=".8"/><ellipse cx="32" cy="30" rx="26" ry="7.5" fill="${broth}" ${SW}/>${items}${fFace(32,44)}`;
const cupA=(fill,extra='',straw='#F06B9B')=>`<path d="M35 2l-2 15" stroke="${straw}" stroke-width="4.5" stroke-linecap="round"/><path d="M18 16h28l-3.5 38q-10.5 4-21 0z" fill="${fill}" ${SW}/>${extra}<path d="M16 11h32v6H16z" fill="#FFFFFF" ${SW}/>${fFace(32,38)}`;
const ART={
 food_kaprao:()=>plateA(riceA()+`<path d="M18 37q4-8 11-5q6-5 11 1q3 5-5 7q-9 2-17-3z" fill="#9A5B34" ${SW}/>`+leafA(23,32)+leafA(30,29,20)+eggA(40,30)),
 food_friedrice:()=>plateA(riceA('#F3D98B')+ballA(24,33,1.8,'#E88A4A')+ballA(33,30,1.8,'#7CBF5A')+ballA(40,34,1.8,'#C9874F')+`<path d="M44 34a5 5 0 0 1 9 0z" fill="#B5DB6A" ${SW2}/>`),
 food_padthai:()=>plateA(pileA('#E9B25F')+`<path d="M20 36q6-3 12 0t12 0M23 32q5-3 10 0t8 0" stroke="#C98F3A" stroke-width="1.8" fill="none" stroke-linecap="round"/>`+shrimpA(22,31)+shrimpA(34,28)+`<path d="M44 33a5 5 0 0 1 9 0z" fill="#B5DB6A" ${SW2}/>`),
 food_khaomankai:()=>plateA(riceA()+`<rect x="19" y="27" width="24" height="6.5" rx="3.2" transform="rotate(-8 31 30)" fill="#FFF1D6" ${SW}/><rect x="21" y="33" width="22" height="6" rx="3" transform="rotate(-6 32 36)" fill="#FFF1D6" ${SW}/>`+ballA(48,38,3,'#8CCB6E')+ballA(15,39,3,'#8CCB6E')),
 food_omelet_rice:()=>plateA(riceA()+`<path d="M15 37q17-17 34 0q-17 7-34 0z" fill="#F7C548" ${SW}/><path d="M24 31q3 2 6 0M33 30q3 2 6 0" stroke="#E0A52E" stroke-width="1.6" fill="none" stroke-linecap="round"/>`),
 food_stirfry_noodle:()=>plateA(pileA('#9A6440')+`<path d="M20 35q6-4 12 0t12 0M23 31q5-3 10 0t8 0" stroke="#7A4A2C" stroke-width="2.4" fill="none" stroke-linecap="round"/>`+leafA(24,30,10,'#4E9E4E')+leafA(38,33,-30,'#4E9E4E')),
 food_noodle_clear:()=>bowlA('#F6E3B4',noodlesA('#FFF8E8')+ballA(22,28,3.4,'#C99A6B')+ballA(31,26.5,3.2,'#C99A6B')+ballA(39,31,1.6,'#6DBB5C')+ballA(44,27,1.6,'#6DBB5C')),
 food_tomyum_noodle:()=>bowlA('#F2A65A',noodlesA('#FFF3D6')+ballA(36,27,3.2,'#C99A6B')+ballA(24,27,1.3,'#D9483B')+ballA(28,31,1.3,'#D9483B')+`<path d="M41 27a5 5 0 0 1 10 0z" fill="#B5DB6A" ${SW2}/>`),
 food_clear_soup:()=>bowlA('#F4EBD0',`<rect x="17" y="25" width="7" height="7" rx="1.5" fill="#fff" ${SW2}/><rect x="27" y="27" width="7" height="7" rx="1.5" fill="#fff" ${SW2}/>`+ballA(40,28,2.6,'#B98560')+leafA(45,31,0,'#7CBF5A')+ballA(36,32,1.4,'#6DBB5C')),
 food_suki:()=>bowlA('#F2C09A',noodlesA('#FFFFFF')+leafA(20,27,10,'#B9E09A')+leafA(25,28,-20,'#B9E09A')+ballA(36,28,3.6,'#F7C548')+ballA(44,30,2.6,'#E8B488')),
 food_congee:()=>bowlA('#F6EFE0',`<ellipse cx="31" cy="29" rx="7" ry="4.5" fill="#fff" ${SW2}/>`+ballA(31,29,3,'#F7C548')+`<path d="M19 29l4-2M42 30l4-1" stroke="#E8A14A" stroke-width="2" stroke-linecap="round"/>`+ballA(22,32,1.4,'#6DBB5C')+ballA(44,27,1.4,'#6DBB5C')),
 food_green_curry:()=>bowlA('#B9D98A',`<rect x="20" y="25" width="9" height="6" rx="3" fill="#FFF1D6" ${SW2}/>`+ballA(35,28,3,'#7CBF5A')+ballA(41,31,2.6,'#7CBF5A')+`<path d="M26 32l4-1M44 26l3 1" stroke="#D9483B" stroke-width="2" stroke-linecap="round"/>`),
 food_salad_chicken:()=>bowlA('#A8D98A',leafA(17,28,-10,'#6DBB5C')+leafA(46,28,30,'#6DBB5C')+`<rect x="22" y="24" width="12" height="5" rx="2.5" fill="#E6B583" ${SW2}/><rect x="28" y="29" width="12" height="5" rx="2.5" fill="#E6B583" ${SW2}/>`+ballA(42,25,2.8,'#E85A4F'),'#FFFFFF'),
 food_chicken_steak:()=>plateA(`<path d="M16 38q2-11 15-11t15 8q-2 7-15 7t-15-4z" fill="#C9874F" ${SW}/><path d="M22 31l6 7M28 29l7 8M35 29l6 7" stroke="#9A5B34" stroke-width="1.8" stroke-linecap="round"/>`+ballA(48,35,3.4,'#5BAA5B')+`<rect x="44" y="39" width="8" height="3" rx="1.5" fill="#F09A4A" ${SW2}/>`),
 food_somtam:()=>bowlA('#BFD97A',`<path d="M16 28l8 2M22 31l9-1M30 27l8 2M36 31l8-1M24 26l6 1" stroke="#7BB34A" stroke-width="2.2" stroke-linecap="round"/>`+ballA(40,28,3.4,'#E85A4F')+ballA(26,29,1.6,'#D9483B'),'#D9A070'),
 food_grilled_chicken:()=>`<path d="M38 24l12-12" stroke="${O}" stroke-width="8.5" stroke-linecap="round"/><path d="M38 24l12-12" stroke="#FFFDF7" stroke-width="4" stroke-linecap="round"/><circle cx="51" cy="10" r="4" fill="#FFFDF7" ${SW2}/><circle cx="54" cy="14" r="3.6" fill="#FFFDF7" ${SW2}/><path d="M14 44c-6-12 6-26 20-22 12 4 12 17 3 23-7 5-17 7-23-1z" fill="#D9883E" ${SW}/><path d="M20 30q4-3 8 0M18 38q4-3 8 0" stroke="#B5662A" stroke-width="1.8" fill="none" stroke-linecap="round"/>${fFace(26,40)}`,
 food_larb:()=>plateA(pileA('#B07A4E')+ballA(22,34,2,'#8E5E38')+ballA(30,30,2,'#8E5E38')+ballA(38,34,2,'#8E5E38')+leafA(26,31,-10,'#4E9E4E')+leafA(36,30,25,'#4E9E4E')+leafA(43,35,0,'#4E9E4E')),
 food_glass_noodle_salad:()=>plateA(pileA('#F5E6D3')+`<path d="M19 36q6-4 12 0t12 0M22 32q5-3 10 0t9 0" stroke="#DCC7AE" stroke-width="1.6" fill="none"/>`+shrimpA(21,31)+shrimpA(35,29)+ballA(29,36,1.4,'#D9483B')+leafA(43,32,-20,'#5BAA5B')),
 food_tomyum_soup:()=>bowlA('#F2B35A',shrimpA(17,29)+shrimpA(30,26)+`<path d="M40 27q3-4 6 0z" fill="#E8D7C0" ${SW2}/>`+leafA(25,31,20,'#5BAA5B')+ballA(44,31,1.4,'#D9483B')),
 food_stirfry_veg:()=>plateA(ballA(22,34,4,'#5BAA5B')+ballA(27,31,3.4,'#6DBB5C')+`<rect x="31" y="33" width="9" height="3.4" rx="1.7" fill="#F09A4A" ${SW2}/><rect x="35" y="29" width="9" height="3.4" rx="1.7" fill="#F09A4A" ${SW2}/>`+`<path d="M41 36q3-5 7 0z" fill="#C9A27A" ${SW2}/>`),
 food_mackerel:()=>plateA(`<path d="M13 37q11-11 26 0q-15 9-26 0z" fill="#9FB4C7" ${SW}/><path d="M39 37l8-6v12z" fill="#9FB4C7" ${SW}/><circle cx="19" cy="35.5" r="1.4" fill="${O}"/><path d="M26 33v7M31 33v7" stroke="#7E95AA" stroke-width="1.4"/>`+`<path d="M44 26h10q-1 6-5 6t-5-6z" fill="#fff" ${SW2}/><ellipse cx="49" cy="26" rx="5" ry="1.6" fill="#D9483B"/>`),
 food_moo_ping:()=>plateA([0,1,2].map(i=>`<path d="M${14+i*3} ${42-i*4}l34-4" stroke="#C9A27A" stroke-width="2" stroke-linecap="round"/>${[0,1,2].map(j=>`<ellipse cx="${24+i*3+j*8}" cy="${40.5-i*4-j*1}" rx="4.2" ry="3" fill="#B5662A" ${SW2}/>`).join('')}`).join('')),
 food_rice:()=>`<path d="M10 34h44q-1 20-22 20T10 34z" fill="#fff" ${SW}/><path d="M11 34q21-22 42 0z" fill="#fff" ${SW}/><path d="M24 27l2-1M32 24l2 0M40 28l2 1" stroke="#E2DACB" stroke-width="1.6" stroke-linecap="round"/>${fFace(32,44)}`,
 food_brown_rice:()=>`<path d="M10 34h44q-1 20-22 20T10 34z" fill="#fff" ${SW}/><path d="M11 34q21-22 42 0z" fill="#D9B98A" ${SW}/><path d="M24 27l2-1M32 24l2 0M40 28l2 1" stroke="#B89A6E" stroke-width="1.6" stroke-linecap="round"/>${fFace(32,44)}`,
 food_sticky_rice:()=>`<path d="M14 26h36l-4 28H18z" fill="#E3B873" ${SW}/><path d="M16 34h32M17 42h30M18 50h28M24 26l-1 28M32 26v28M40 26l1 28" stroke="#C9964E" stroke-width="1.4"/><path d="M11 26q21-16 42 0z" fill="#F0CE8C" ${SW}/>${fFace(32,38)}`,
 food_boiled_egg:()=>`<ellipse cx="23" cy="34" rx="12" ry="15" fill="#FFF8EC" ${SW}/>${fFace(23,36)}<ellipse cx="43" cy="42" rx="12" ry="11" fill="#fff" ${SW}/><circle cx="43" cy="42" r="5.6" fill="#F7C548" ${SW2}/>`,
 cvs_chicken_breast:()=>`<rect x="9" y="14" width="46" height="38" rx="9" fill="#CFE6F7" ${SW}/><rect x="15" y="20" width="34" height="14" rx="6" fill="#F3DFC2" ${SW2}/><path d="M22 23v8M30 23v8M38 23v8" stroke="#E0C49E" stroke-width="1.6"/>${fFace(32,43)}`,
 cvs_bento:()=>`<rect x="7" y="20" width="50" height="30" rx="7" fill="#F7F7F2" ${SW}/><path d="M32 22v26" stroke="${O}" stroke-width="1.8"/><path d="M11 40q10-14 19 0z" fill="#fff" ${SW2}/><path d="M35 38q4-8 9-5q5-3 9 2q2 5-9 5t-9-2z" fill="#9A5B34" ${SW2}/>${leafA(42,32,10)}<path d="M9 24h46" stroke="#DCE9F2" stroke-width="2"/>${fFace(32,52)}`,
 cvs_sandwich:()=>`<path d="M9 50L32 10l23 40z" fill="#F7E3B5" ${SW}/><path d="M15 42h34" stroke="#8CCB6E" stroke-width="4" stroke-linecap="round"/><path d="M17 37h30" stroke="#F3C9A0" stroke-width="3" stroke-linecap="round"/>${fFace(32,30)}`,
 cvs_bun:()=>`<path d="M10 46q0-26 22-26t22 26q-22 7-44 0z" fill="#FFFDF7" ${SW}/><path d="M32 20q-3 4 0 8q3-4 0-8M25 22q0 4 3 6M39 22q0 4-3 6" stroke="#E8DCC8" stroke-width="1.6" fill="none"/>${fFace(32,38)}`,
 cvs_yogurt:()=>`<path d="M44 6l-8 16" stroke="#C9C9C9" stroke-width="3.4" stroke-linecap="round"/><path d="M14 22h36l-4 30q-14 4-28 0z" fill="#fff" ${SW}/><path d="M15.5 32h33l-1 8h-31z" fill="#B9D2F2"/><ellipse cx="32" cy="22" rx="18" ry="4" fill="#FFFDF7" ${SW}/>${fFace(32,47)}`,
 snack_egg_white:()=>plateA(`<ellipse cx="21" cy="36" rx="7" ry="5" fill="#fff" ${SW2}/><ellipse cx="32" cy="32" rx="7" ry="5" fill="#fff" ${SW2}/><ellipse cx="43" cy="36" rx="7" ry="5" fill="#fff" ${SW2}/>`),
 drink_thaitea:()=>cupA('#F2994A',`<path d="M19.2 22h25.6l-.6 7h-24.4z" fill="#F7C59F"/>`),
 drink_coffee:()=>cupA('#C8A07A',`<path d="M19.2 22h25.6l-.6 7h-24.4z" fill="#EBD9C3"/>`,'#7A9E7E'),
 drink_bubbletea:()=>cupA('#E8CFA6',[[25,48],[31,49],[37,48],[28,44],[35,44]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="#4A3426"/>`).join(''),'#8E7CC3'),
 drink_americano:()=>`<path d="M17 14h30l-3 40q-12 4-24 0z" fill="#E8F2F7" ${SW}/><path d="M18.5 24h27l-2.2 28q-11.3 4-22.6 0z" fill="#5A3B28"/><rect x="23" y="26" width="7" height="7" rx="1.5" fill="#DDEEF6" opacity=".9" transform="rotate(10 26 29)"/><rect x="33" y="28" width="7" height="7" rx="1.5" fill="#DDEEF6" opacity=".9" transform="rotate(-8 36 31)"/>${fFace(32,44).replaceAll(O,'#F6E7D8')}`,
 drink_soda:()=>`<rect x="19" y="10" width="26" height="44" rx="7" fill="#E85A4F" ${SW}/><path d="M21 16h22" stroke="#C9C9C9" stroke-width="3"/><path d="M25 22v24" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>${fFace(32,36).replaceAll(O,'#FFFFFF')}`,
 drink_milk:()=>`<path d="M18 22l7-10h14l7 10v32H18z" fill="#fff" ${SW}/><path d="M25 12l7 10h14" fill="none" ${SW2}/><path d="M18.8 34h26.4v10H18.8z" fill="#9EC5F0"/>${fFace(32,29)}`,
 drink_soymilk:()=>`<path d="M26 6h12v8l6 6v32q0 4-4 4H24q-4 0-4-4V20l6-6z" fill="#F8F0D8" ${SW}/><path d="M26 6h12v5H26z" fill="#8CCB6E" ${SW2}/><path d="M21 34h22v10H21z" fill="#BFE0A6"/>${fFace(32,28)}`,
 drink_protein:()=>`<path d="M17 20h30v32q0 4-4 4H21q-4 0-4-4z" fill="#C7B8F0" ${SW}/><path d="M19 12h26v8H19z" fill="#8E7CC3" ${SW}/><path d="M28 6h8v6h-8z" fill="#8E7CC3" ${SW2}/>${fFace(32,36)}`,
 drink_water:()=>`<path d="M17 12h30l-3 42q-12 4-24 0z" fill="#EAF6FB" ${SW}/><path d="M18.4 24h27.2l-2.3 29q-11.3 4-22.6 0z" fill="#9ED8EC"/><path d="M50 10l2-5 2 5-2 5zM12 18l1.5-3.5 1.5 3.5-1.5 3.5z" fill="#4FC2D8"/>${fFace(32,40)}`,
 snack_banana:()=>`<path d="M12 22q4 28 34 26q6-1 8-6q-26 2-36-22q-3-2-6 2z" fill="#F7D453" ${SW}/><path d="M12 22l-3-4" ${SW}/>${fFace(36,40)}`,
 snack_apple:()=>`<path d="M32 18q-12-6-18 4q-6 14 4 26q6 6 14 2q8 4 14-2q10-12 4-26q-6-10-18-4z" fill="#EF6F64" ${SW}/><path d="M32 18q0-6 3-9" ${SW}/>${leafA(39,11,-20,'#7CBF5A')}${fFace(32,36)}`,
 snack_orange:()=>`<circle cx="28" cy="34" r="18" fill="#F7A23B" ${SW}/>${leafA(29,15,-30,'#7CBF5A')}${fFace(28,36)}<path d="M44 46a10 10 0 0 1 14-8z" fill="#FFD08A" ${SW2}/>`,
 snack_almonds:()=>`<path d="M10 34h44q-1 18-22 18T10 34z" fill="#F4E3C8" ${SW}/>${[[20,31],[28,28],[36,30],[44,31],[32,33],[24,34]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="3" transform="rotate(${i*25-30} ${x} ${y})" fill="#B5784A" ${SW2}/>`).join('')}${fFace(32,44)}`,
 snack_bread:()=>`<path d="M14 54V28q-6-4-2-12q6-8 20-8t20 8q4 8-2 12v26z" fill="#D9A766" ${SW}/><path d="M18 52V29q-4-3-1-8q5-6 15-6t15 6q3 5-1 8v23z" fill="#F3DDB0"/>${fFace(32,38)}`,
 empty_plate:()=>`<ellipse cx="32" cy="38" rx="28" ry="14" fill="#FFFFFF" ${SW}/><ellipse cx="32" cy="36" rx="20" ry="8.5" fill="#F1EEE6"/><path d="M8 18v12M5 18v6q0 4 3 4t3-4v-6M56 18v16" ${SW}/><path d="M56 18q-5 2-5 8h5" fill="#fff" ${SW2}/>${fFace(32,37)}`};
const ART_CACHE={};
function foodImg(key,size=44){
  const src=imgSrc(key); if(src) return `<span class="fart" style="--s:${size}px"><img src="${src}" alt="" loading="lazy"></span>`;
  const k=ART[key]?key:'empty_plate';
  return `<span class="fart" style="--s:${size}px" aria-hidden="true"><svg viewBox="0 0 64 64">${ART_CACHE[k]||(ART_CACHE[k]=ART[k]())}</svg></span>`;
}
const bossArt=()=>imgSrc('boss_lazy')?`<img src="${imgSrc('boss_lazy')}" alt="" class="bossimg">`:bossSVG;
const CATS=[['all','ทั้งหมด'],['fav','เมนูประจำ'],['protein','โปรตีนสูง'],['dish','จานเดียว'],['side','กับข้าว'],['cvs','ร้านสะดวกซื้อ'],['snack','ผลไม้ ของว่าง'],['drink','เครื่องดื่ม'],['mine','เมนูของฉัน']];
const MEALS=[['b','เช้า'],['l','กลางวัน'],['d','เย็น'],['s','ของว่าง']];
const ACT=[[1.2,'นั่งทำงาน แทบไม่ได้ขยับ'],[1.375,'ขยับบ้าง ออกกำลัง 1–3 วัน/สัปดาห์'],[1.55,'ออกกำลัง 3–5 วัน/สัปดาห์'],[1.725,'ออกกำลังหนักเกือบทุกวัน']];
const TIPS=[
 'กินโปรตีนทุกมื้อ ช่วยให้อิ่มนานและรักษากล้ามเนื้อไว้ตอนลดน้ำหนัก หุ่นจะกระชับ ไม่ใช่แค่ผอมลง',
 'ดื่มน้ำหนึ่งแก้วก่อนกินข้าว ช่วยให้รู้สึกอิ่มเร็วขึ้น',
 'น้ำหนักแกว่งได้ 1–2 กก. ต่อวันจากน้ำและเกลือ ดูแนวโน้มทั้งสัปดาห์ดีกว่าดูวันเดียว',
 'เครื่องดื่มหวานหนึ่งแก้วอาจเท่ากับข้าวหนึ่งจาน สั่งหวานน้อยหรือไม่หวานช่วยได้มาก',
 'นอนน้อยทำให้หิวง่ายและอยากของหวาน พยายามนอนให้ได้ 7 ชั่วโมง',
 'เวทช่วยให้กระชับและเผาผลาญดีขึ้น คาร์ดิโอช่วยหัวใจ ทำคู่กันได้ผลดีที่สุด',
 'กินผักก่อนข้าว ช่วยให้อิ่มเร็วและน้ำตาลในเลือดขึ้นช้าลง',
 'เดินเพิ่มวันละนิด เช่น ลงรถก่อนหนึ่งป้าย ช่วยเผาผลาญได้มากกว่าที่คิด',
 'ลดน้ำหนักแบบยั่งยืนอยู่ที่ราว 0.25–0.75 กก. ต่อสัปดาห์ ช้าแต่ไม่เด้งกลับ'];
const SWAPS=[
 ['ข้าวกะเพราหมูสับไข่ดาว','กะเพราไก่ เปลี่ยนไข่ดาวเป็นไข่ต้ม','−150 kcal'],
 ['ชาไทยเย็น','ชาไทยหวานน้อย แก้วเล็ก','−150 kcal'],
 ['ข้าวมันไก่','ข้าวมันไก่ต้ม ไม่เอาหนัง ข้าวน้อย','−200 kcal'],
 ['ผัดไทย','ผัดไทยน้ำมันน้อย ลดเส้น เพิ่มไข่','−150 kcal'],
 ['ก๋วยเตี๋ยวต้มยำ','เกาเหลาต้มยำ + ข้าวครึ่งทัพพี','−120 kcal'],
 ['ส้มตำ + ข้าวเหนียว','ส้มตำ + ไก่ย่าง ข้าวเหนียวครึ่งห่อ','+โปรตีน'],
 ['ชานมไข่มุก','ชานมหวาน 25% ไม่ใส่ไข่มุก','−200 kcal']];

/* exercise demo poses: 11 joints [head, neck, hip, kneeL, footL, kneeR, footR, elbowL, handL, elbowR, handR] */
const ST=[50,13,50,21,50,44,51,58,52,74,49,58,48,74,52,32,54,43,48,32,47,43];
const POSE={
 squat:[[50,13,50,21,50,44,51,58,52,74,49,58,48,74,55,29,58,26,54,29,57,26],[53,30,51,37,38,55,54,57,52,74,52,57,50,74,57,44,61,40,56,44,60,40],2600],
 pushup:[[72,47,65,51,42,60,30,66,18,71,31,66,19,71,65,62,65,73,66,62,66,73],[72,60,65,63,42,66,30,69,18,71,31,69,19,71,57,64,65,73,58,64,66,73],2400],
 row:[[68,32,61,36,40,46,44,60,46,74,37,60,35,74,64,46,66,56,59,47,59,58],[68,32,61,36,40,46,44,60,46,74,37,60,35,74,64,46,66,56,50,33,54,43],2200],
 bridge:[[14,67,22,69,46,71,56,58,66,73,57,58,67,73,32,72,42,73,33,72,43,73],[14,67,22,69,46,57,58,54,66,73,59,54,67,73,32,72,42,73,33,72,43,73],2600],
 plank:[[71,60,64,62,42,64,30,68,18,71,31,68,19,71,63,73,73,73,64,73,74,73],[71,59.5,64,62,42,65.5,30,68.5,18,71,31,68.5,19,71,63,73,73,73,64,73,74,73],3200],
 rdl:[[50,13,50,21,50,44,51,58,52,74,49,58,48,74,51,32,51,44,49,32,49,44],[72,37,65,40,42,45,46,59,50,74,44,59,48,74,64,51,63,62,63,51,62,62],2800],
 lunge:[[50,13,50,21,50,44,51,58,52,74,49,58,48,74,55,34,52,44,54,34,51,44],[49,26,49,34,48,57,60,58,61,74,40,71,28,73,54,46,50,56,53,46,49,56],2800],
 press:[[50,13,50,21,50,44,51,58,52,74,49,58,48,74,57,26,56,16,43,26,44,16],[50,13,50,21,50,44,51,58,52,74,49,58,48,74,55,11,53,0,45,11,47,0],2400],
 superman:[[80,67,72,69,48,71,34,72,20,72,34,73,20,73,82,70,92,70,82,71,92,71],[81,61,72,65,48,71,34,69,21,64,34,70,21,65,82,61,91,56,82,62,91,57],2600],
 deadbug:[[80,66,72,68,48,70,48,56,37,56,50,56,39,56,72,57,72,46,73,57,73,46],[80,66,72,68,48,70,36,65,24,68,50,56,39,56,72,57,72,46,81,62,90,60],2600],
 march:[[50,13,50,21,50,44,62,45,61,60,49,58,48,74,46,32,45,43,55,31,59,38],[50,13,50,21,50,44,51,58,52,74,62,45,61,60,54,31,58,38,46,32,45,43],1100],
 stretch:[ST,[50,13,50,21,50,44,51,58,52,74,49,58,48,74,53,11,52,0,47,11,48,0],3600]};
POSE.wallpush=POSE.pushup; POSE.walk=[POSE.march[0],POSE.march[1],1500];
const SEGS=[[1,2,0],[2,3,0],[3,4,0],[2,5,1],[5,6,1],[1,7,0],[7,8,0],[1,9,1],[9,10,1],[0,1,0]];
const FIGFILE={squat:'ex_squat',pushup:'ex_pushup',wallpush:'ex_wall_pushup',row:'ex_row',bridge:'ex_bridge',plank:'ex_plank',rdl:'ex_rdl',lunge:'ex_lunge',press:'ex_press',superman:'ex_superman',deadbug:'ex_deadbug',march:'ex_march',walk:'ex_walk',stretch:'ex_stretch'};
function figSVG(k){
  const fk=S.profile.sex==='m'&&imgSrc(FIGFILE[k]+'_male')?FIGFILE[k]+'_male':FIGFILE[k];   /* men see the male figure when it exists */
  if(imgSrc(fk)) return `<img class="fig figimg" src="${imgSrc(fk)}" alt="">`;
  const p=(POSE[k]||POSE.stretch)[0];
  return `<svg class="fig" viewBox="0 -6 100 84" data-fig="${k}" aria-hidden="true"><line class="floor" x1="6" y1="76.5" x2="94" y2="76.5"/>${SEGS.map(([a,b,f])=>`<line class="b${f?' far':''}" x1="${p[a*2]}" y1="${p[a*2+1]}" x2="${p[b*2]}" y2="${p[b*2+1]}"/>`).join('')}<circle cx="${p[0]}" cy="${p[1]}" r="5.6"/></svg>`;
}
const EX_A=[
 {n:'สควอท',fig:'squat',alt:'ถือดัมเบลหรือขวดน้ำไว้ที่อก หรือใช้ตัวเปล่า',cue:'นั่งลงเหมือนนั่งเก้าอี้ หลังตรง เข่าชี้ไปทางเดียวกับปลายเท้า'},
 {n:'วิดพื้น',fig:'pushup',alt:'ไล่ระดับ: ดันกำแพง → ดันโต๊ะ → คุกเข่า → เต็มตัว',cue:'ลำตัวตรงเป็นแผ่นเดียว ลงช้า ๆ สองวินาที',bw:1},
 {n:'แถวดัมเบลแขนเดียว',fig:'row',alt:'ใช้ขวดน้ำหรือกระเป๋าใส่ของแทนได้',cue:'ดึงศอกไปทางสะโพก บีบสะบักค้างไว้หนึ่งวินาที'},
 {n:'Glute bridge',fig:'bridge',alt:'นอนหงาย ชันเข่า วางดัมเบลบนสะโพกได้',cue:'ยกสะโพกขึ้น บีบก้นค้างสองวินาที แล้วลงช้า ๆ'},
 {n:'แพลงก์',fig:'plank',alt:'ยากไปให้วางเข่าลงพื้นได้',cue:'เกร็งท้อง สะโพกไม่ตก หายใจปกติ',time:1,bw:1}];
const EX_B=[
 {n:'Romanian deadlift',fig:'rdl',alt:'ถือดัมเบลหรือขวดน้ำสองข้าง',cue:'ดันสะโพกไปข้างหลัง หลังตรง รู้สึกตึงหลังต้นขา'},
 {n:'Reverse lunge',fig:'lunge',alt:'จับพนักเก้าอี้ช่วยทรงตัวได้',cue:'ก้าวถอยหลัง ลดเข่าหลังลงใกล้พื้น แล้วดันกลับด้วยขาหน้า'},
 {n:'ยกดัมเบลเหนือศีรษะ',fig:'press',alt:'นั่งเก้าอี้ทำได้ ใช้ขวดน้ำแทนได้',cue:'เกร็งท้อง ดันขึ้นตรง ๆ ไม่แอ่นหลัง'},
 {n:'Superman',fig:'superman',alt:'นอนคว่ำบนเสื่อ',cue:'ยกแขนและขาขึ้นพร้อมกัน ค้างสองวินาที',bw:1},
 {n:'Dead bug',fig:'deadbug',alt:'นอนหงาย ยกแขนขาขึ้น',cue:'เหยียดแขนขาฝั่งตรงข้ามช้า ๆ หลังล่างแนบพื้นตลอด',bw:1}];
const REPS=[[2,10],[3,10],[3,12],[3,12]], PLANK=[20,25,30,40];
const FAST='เร็ว! เดินเร็วสุดหรือวิ่งเหยาะ', EASY='ฟื้นตัว เดินปกติ';
function cardioSegs(w){
  const s=[{l:'วอร์มอัพ เดินสบาย ๆ',s:180,fig:'walk'}];
  if(w===1) s.push({l:'เดินเร็ว พูดได้แต่ร้องเพลงไม่ไหว',s:900,fig:'walk'});
  else if(w===2) s.push({l:'เดินเร็ว พูดได้แต่ร้องเพลงไม่ไหว',s:1200,fig:'walk'});
  else { const n=w===3?5:6, r=w===3?120:90; for(let i=0;i<n;i++){s.push({l:FAST,s:60,fig:'walk'});s.push({l:EASY,s:r,fig:'walk'});} s.push({l:'เดินเร็วต่อเนื่อง',s:300,fig:'walk'}); }
  s.push({l:'คูลดาวน์ เดินช้า ยืดเหยียด',s:120,fig:'stretch'}); return s;
}
const MINI=[['สควอทตัวเปล่า','squat'],['วิดพื้นกับกำแพง','wallpush'],['Glute bridge','bridge'],['ย่ำเท้าอยู่กับที่ ยกเข่าสูง','march'],['แพลงก์ (วางเข่าได้)','plank']];
function miniSegs(){const s=[];for(let r=1;r<=2;r++)MINI.forEach(([n,f],i)=>{s.push({l:`รอบ ${r} · ${n}`,s:i===4?30:40,fig:f});s.push({l:'พัก หายใจลึก ๆ',s:i===4?30:20})});return s}
const STRETCH=['เอียงคอซ้ายขวาช้า ๆ','หมุนไหล่ไปหน้าและหลัง','ประสานมือหลัง เปิดอก','แมวโก่งหลัง สลับแอ่นหลัง','นั่งไขว่ห้าง โน้มตัวยืดสะโพก (ซ้าย)','นั่งไขว่ห้าง โน้มตัวยืดสะโพก (ขวา)','นั่งเหยียดขา ก้มแตะปลายเท้า'];
const stretchSegs=()=>STRETCH.flatMap(n=>[{l:n,s:40,fig:'stretch'},{l:'เปลี่ยนท่า',s:5}]);
const TOTAL_SESS=16;
function sessionInfo(n){
  const i=n%TOTAL_SESS, week=Math.floor(i/4)+1, type=['A','C','B','C'][i%4];
  const title=type==='C'?'คาร์ดิโอ':'เวทเต็มตัว '+type;
  const min=type==='C'?Math.round(cardioSegs(week).reduce((a,b)=>a+b.s,0)/60):(week===1?25:35);
  return {n,i,week,type,title,min,round:Math.floor(n/TOTAL_SESS)+1};
}
const UNLOCKS=[[3,'ผ้าพันคอแดง'],[5,'ร่างแมววัยรุ่น + ที่คาดผมนักกีฬา'],[8,'ดัมเบลจิ๋วคู่ใจ'],[10,'ร่างแมวโตเต็มวัย'],[15,'ห้องยิมส่วนตัวของน้องแมว']];
const SKINS={orange:{name:'ส้มลายเสือ',b:'#F2A65A',bl:'#FCE3C4',st:'#D9823A',ear:'#F7B6A3',eye:'#3A2A20',tail:'#E8964A',wh:'#C9874F'},
 gray:{name:'เทาหมอก',b:'#A5ADB6',bl:'#E6E9EC',st:'#78828C',ear:'#F2B8C0',eye:'#2A2F35',tail:'#8D96A0',wh:'#6E7882'},
 cream:{name:'ครีมนมสด',b:'#F1E2CC',bl:'#FFF7EC',st:'#D6BE9C',ear:'#F5B9B0',eye:'#3A2A20',tail:'#E3CFB2',wh:'#C2A882'},
 black:{name:'ดำนิล',b:'#3B3B43',bl:'#55555F',st:'#2A2A30',ear:'#E39AA6',eye:'#F4D35E',tail:'#2F2F36',wh:'#8A8A95'}};
const SHOP=[{id:'bow',slot:'head',name:'โบว์ชมพู',price:20},{id:'flower',slot:'head',name:'ดอกไม้ทัดหู',price:30},{id:'cap',slot:'head',name:'หมวกแก๊ป',price:40},
 {id:'beanie',slot:'head',name:'หมวกไหมพรม',price:55},{id:'glasses',slot:'face',name:'แว่นกันแดด',price:70},{id:'gray',slot:'skin',name:'สีเทาหมอก',price:90},
 {id:'cream',slot:'skin',name:'สีครีมนมสด',price:90},{id:'headphones',slot:'head',name:'หูฟังสายฟิต',price:110},{id:'black',slot:'skin',name:'สีดำนิล',price:130},{id:'crown',slot:'head',name:'มงกุฎแชมป์',price:220}];

/* ================= state ================= */
const KEY='pawfit.v1';
const pad=n=>String(n).padStart(2,'0');
const dk=(d=new Date())=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const pd=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const ago=n=>{const d=new Date();d.setDate(d.getDate()-n);return dk(d)};
const logOf=(f,meal,qty=1)=>({name:f.name,kcal:f.kcal,p:f.p,c:f.c,f:f.f,tags:f.tags||[],art:f.art,meal,qty});
function bmrOf(p){return 10*p.weight+6.25*p.height-5*p.age+(p.sex==='m'?5:-161)}
function calcTargets(p){
  const tdee=bmrOf(p)*p.activity;
  let kcal=Math.round((tdee-(p.goal<p.weight?400:0))/10)*10;
  kcal=Math.max(kcal,p.sex==='m'?1500:1200);
  return {tdee:Math.round(tdee/10)*10,kcal,protein:Math.round(p.weight*1.6/5)*5,water:Math.max(6,Math.round(p.weight*33/250))};
}
const DEF_GOALS={steps:8000,sleep:7,wpw:3,waistGoal:0,accent:'leaf'};
function blankState(profile,pet){
  return {v:3,onboarded:true,obSeen:true,example:false,profile,days:{},weights:[],waist:[],custom:[],favs:['f30','f29','f1'],lifts:{},
    pet:{name:'ข้าวปั้น',bonus:0,spent:0,owned:['orange'],equip:{head:null,face:null,skin:'orange'},...pet},program:{done:0},lastBackup:null,adaptSeen:null};
}
function seed(){
  const prof={sex:'f',age:28,height:160,weight:62.3,goal:55,activity:1.375,...DEF_GOALS};
  Object.assign(prof,calcTargets(prof)); delete prof.tdee;
  const st=blankState(prof); st.example=true; st.onboarded=false; st.obSeen=false; st.favs=['f30','f29','f1','f45']; st.lifts={'สควอท':4};
  const L=(name,meal)=>logOf(FOODS.find(f=>f.name===name),meal);
  const B=[['โจ๊กหมูใส่ไข่'],['ไข่ต้ม 2 ฟอง','นมถั่วเหลืองหวานน้อย'],['แซนด์วิชทูน่า','อเมริกาโน่ไม่หวาน'],['โยเกิร์ตกรีก 1 ถ้วย','กล้วยหอม 1 ลูก']];
  const LU=[['ข้าวกะเพราไก่ (ไม่ใส่ไข่)'],['ก๋วยเตี๋ยวเส้นเล็กน้ำใสหมู','ไข่ต้ม 2 ฟอง'],['ข้าวมันไก่'],['สุกี้น้ำไก่','ข้าวสวย 1 ทัพพี'],['ข้าวกล่องกะเพราไก่']];
  const DI=[['ข้าวสวย 1 ทัพพี','แกงจืดเต้าหู้หมูสับ','ไก่ย่าง 1 น่อง'],['สลัดอกไก่','ข้าวกล้อง 1 ทัพพี'],['ส้มตำไทย','ไก่ย่าง 1 น่อง','ข้าวเหนียว 1 ห่อ'],['ข้าวต้มปลา','อกไก่นุ่ม 1 ซอง'],['ปลาทูนึ่ง + น้ำพริก','ข้าวกล้อง 1 ทัพพี','ผัดผักรวม']];
  const SN=[['ชาไทยเย็น'],['แอปเปิล 1 ลูก','อัลมอนด์ 1 กำมือ'],['กาแฟเย็น'],['ซาลาเปาหมูสับ']];
  for(let i=17;i>=1;i--){
    if(i===9) continue;
    const foods=[...B[i%4].map(n=>L(n,'b')),...LU[i%5].map(n=>L(n,'l')),...DI[(i+2)%5].map(n=>L(n,'d')),...SN[i%4].map(n=>L(n,'s'))];
    st.days[ago(i)]={foods,water:5+(i%4),steps:4200+(i*1370)%6000,sleep:6+(i%3)*.5,weighed:false,workouts:[]};
  }
  st.days[ago(0)]={foods:[L('ไข่ต้ม 2 ฟอง','b'),L('อเมริกาโน่ไม่หวาน','b'),L('ข้าวกะเพราไก่ (ไม่ใส่ไข่)','l')],water:4,steps:3200,sleep:6.5,weighed:false,workouts:[]};
  st.days[ago(12)].workouts=[{kind:'C',name:'เดินเร็ว',min:20}];
  const ws=[[20,63.6],[17,63.3],[14,63.4],[11,63.0],[8,62.9],[5,62.7],[2,62.3]];
  st.weights=ws.map(([a,kg])=>{if(st.days[ago(a)])st.days[ago(a)].weighed=true;return {d:ago(a),kg}});
  st.waist=[{d:ago(14),cm:81},{d:ago(7),cm:80}];
  return st;
}
function migrate(o){
  if(!o||![1,2,3].includes(o.v)) return null;
  if(o.example&&o.v!==3) return null;   /* older sample data: reseed with the newer sample */
  o.v=3; o.profile={...DEF_GOALS,...o.profile};
  o.favs=o.favs||['f30','f29','f1']; o.lifts=o.lifts||{}; o.waist=o.waist||[]; o.custom=o.custom||[];
  o.pet={bonus:0,spent:0,owned:['orange'],...o.pet}; o.pet.equip={head:null,face:null,skin:'orange',...(o.pet.equip||{})};
  if(o.onboarded===undefined){o.onboarded=true;o.obSeen=true}
  Object.values(o.days).forEach(d=>{d.steps=d.steps||0;d.sleep=d.sleep||0;d.workouts=d.workouts||[];d.foods.forEach(f=>f.tags=f.tags||[])});
  return o;
}
let S=null;
try{S=migrate(JSON.parse(localStorage.getItem(KEY)))}catch(e){}
if(!S) S=seed();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let TAB='today', CUR=dk();
const isToday=()=>CUR===dk();

/* ================= helpers ================= */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Math.round(n).toLocaleString('th-TH');
const r1=n=>Math.round(n*10)/10;
const allFoods=()=>S.custom.concat(FOODS);
const foodById=id=>allFoods().find(f=>f.id===id);
const thDate=(k,o={weekday:'long',day:'numeric',month:'long'})=>pd(k).toLocaleDateString('th-TH',o);
function day(k=CUR){return S.days[k]||(S.days[k]={foods:[],water:0,steps:0,sleep:0,workouts:[],weighed:false})}
function totals(d){const t={kcal:0,p:0,c:0,f:0};(d?d.foods:[]).forEach(x=>{t.kcal+=x.kcal*x.qty;t.p+=x.p*x.qty;t.c+=x.c*x.qty;t.f+=x.f*x.qty});return t}
const QUESTS=[
 {id:'protein',t:T=>`ได้โปรตีนถึงเป้า ${T.protein} g`,ok:(d,t,T)=>t.p>=T.protein*.9},
 {id:'water',t:T=>`ดื่มน้ำครบ ${T.water} แก้ว`,ok:(d,t,T)=>d.water>=T.water},
 {id:'log3',t:()=>'บันทึกอาหารครบ 3 มื้อ',ok:d=>new Set(d.foods.map(f=>f.meal).filter(m=>m!=='s')).size>=3},
 {id:'move',t:()=>'ขยับร่างกายอย่างน้อย 10 นาที',ok:d=>d.workouts.length>0},
 {id:'veg',t:()=>'กินเมนูที่มีผักอย่างน้อย 1 มื้อ',ok:d=>d.foods.some(f=>f.tags.includes('veg'))},
 {id:'nosweet',t:()=>'วันนี้งดเครื่องดื่มหวาน',ok:d=>d.foods.length>=2&&!d.foods.some(f=>f.tags.includes('sweet'))},
 {id:'pmorning',t:()=>'มื้อเช้ามีโปรตีน 15 g ขึ้นไป',ok:d=>d.foods.filter(f=>f.meal==='b').reduce((a,f)=>a+f.p*f.qty,0)>=15},
 {id:'steps',t:T=>`เดินให้ได้ ${fmt(T.steps)} ก้าว`,ok:(d,t,T)=>d.steps>=T.steps},
 {id:'sleep',t:T=>`เมื่อคืนนอนครบ ${T.sleep} ชั่วโมง`,ok:(d,t,T)=>d.sleep>=T.sleep}];
function questsFor(k){
  let h=0;for(const c of k)h=(h*31+c.charCodeAt(0))>>>0;
  const pool=QUESTS.slice(),out=[];
  while(out.length<3){h=(h*1103515245+12345)>>>0;out.push(pool.splice(h%pool.length,1)[0]);}
  return out;
}
const qDoneOn=k=>{const d=S.days[k];if(!d)return 0;const t=totals(d);return questsFor(k).filter(q=>q.ok(d,t,S.profile)).length};
function xpParts(k){
  const d=S.days[k]; if(!d) return [];
  const t=totals(d), T=S.profile, meals=new Set(d.foods.map(f=>f.meal));
  const parts=[
   ['บันทึกอาหาร 3 มื้อขึ้นไป',10,meals.size>=3],
   ['โปรตีนถึงเป้า',15,t.p>=T.protein*.9],
   ['แคลอยู่ในช่วงพอดี',15,meals.size>=2&&t.kcal>=T.kcal*.85&&t.kcal<=T.kcal*1.05],
   ['ดื่มน้ำครบ',10,d.water>=T.water],
   ['เดินครบเป้า',10,d.steps>=T.steps],
   ['นอนครบเป้า',5,d.sleep>=T.sleep],
   ['ออกกำลังกาย',20,d.workouts.length>0],
   ['ชั่งน้ำหนัก',5,!!d.weighed]];
  questsFor(k).forEach(q=>parts.push(['ภารกิจ: '+q.t(T),10,q.ok(d,t,T)]));
  parts.push(['โบนัสภารกิจครบ 3 ข้อ',15,qDoneOn(k)===3]);
  return parts;
}
const dayXP=k=>xpParts(k).reduce((a,p)=>a+(p[2]?p[1]:0),0);
const weekKey=k=>{const d=pd(k);d.setDate(d.getDate()-((d.getDay()+6)%7));return dk(d)};
function weekCounts(){const m={};Object.entries(S.days).forEach(([k,d])=>{if(d.workouts.length){const w=weekKey(k);m[w]=(m[w]||0)+d.workouts.length}});return m}
const bossWins=()=>Object.values(weekCounts()).filter(n=>n>=S.profile.wpw).length;
const weekOf=k=>weekCounts()[weekKey(k)]||0;
const totalXP=()=>Object.keys(S.days).reduce((a,k)=>a+dayXP(k),S.pet.bonus||0)+bossWins()*30;
/* level curve: each level needs 25 more EXP than the last (100, 125, 150 …) */
function levelInfo(xp){let lv=1,need=100;while(xp>=need){xp-=need;lv++;need=100+25*(lv-1)}return {lv,cur:xp,need}}
const levelOf=xp=>levelInfo(xp).lv;
const coins=()=>Math.max(0,Math.floor(totalXP()/10)-S.pet.spent);
const active=d=>d&&(d.foods.length>0||d.workouts.length>0);
function streak(){let n=0,i=active(S.days[dk()])?0:1;while(active(S.days[ago(i)])){n++;i++}return n}
function lastWorkoutAgo(){for(let i=0;i<120;i++){const d=S.days[ago(i)];if(d&&d.workouts.length)return i}return null}
const countDays=fn=>Object.values(S.days).filter(d=>fn(d,totals(d),S.profile)).length;
const BADGES=[
 ['first','ก้าวแรก','บันทึกอาหารครั้งแรก','food22',()=>countDays(d=>d.foods.length>0)>=1],
 ['back','กลับมาแล้ว','ออกกำลังครั้งแรกในโปรแกรม','train22',()=>S.program.done>=1],
 ['prot','สายโปรตีน','โปรตีนถึงเป้า 3 วัน','bolt',()=>countDays((d,t,T)=>t.p>=T.protein*.9)>=3],
 ['water','นักดื่มน้ำ','ดื่มน้ำครบ 5 วัน','drop',()=>countDays((d,t,T)=>d.water>=T.water)>=5],
 ['walk','นักเดิน','เดินครบเป้า 5 วัน','shoe',()=>countDays((d,t,T)=>d.steps>=T.steps)>=5],
 ['week','ปราบเจ้าขี้เกียจ','ออกกำลังครบเป้าใน 1 สัปดาห์','sword',()=>bossWins()>=1],
 ['veg','สายผัก','กินผัก 7 วัน','leaf',()=>countDays(d=>d.foods.some(f=>f.tags.includes('veg')))>=7],
 ['fire','ไฟลุก','ต่อเนื่อง 7 วัน','flame22',()=>streak()>=7],
 ['prog','จบโปรแกรม','ทำครบ 16 ครั้ง','star',()=>S.program.done>=16]];
const timePose=()=>{const h=new Date().getHours();return h>=22||h<5?'night':h<10?'morning':'day'};
function petLines(){
  const k=dk(), d=S.days[k]||{foods:[],water:0,workouts:[],steps:0,sleep:0}, t=totals(d), T=S.profile, L=[];
  if(qDoneOn(k)===3) L.push('ภารกิจครบ 3 ข้อแล้ว! เราภูมิใจในตัวเธอสุด ๆ');
  if(d.workouts.length) L.push('วันนี้ออกกำลังแล้ว เท่สุด ๆ ไปเลย');
  if(d.water>=T.water) L.push('ดื่มน้ำครบแล้ว ผิวสวยแน่นอน');
  else if(d.water>0&&T.water-d.water<=3) L.push(`อีก ${T.water-d.water} แก้วน้ำก็ครบแล้วนะ`);
  if(t.p>=T.protein*.9) L.push('โปรตีนถึงเป้าแล้ว กล้ามเนื้อขอบคุณมาก');
  else if(t.p>0&&timePose()!=='morning') L.push(`ยังขาดโปรตีนอีก ${fmt(T.protein-t.p)} g ลองไข่ต้มหรืออกไก่ไหม`);
  if(d.steps>=T.steps) L.push(`เดินครบ ${fmt(T.steps)} ก้าวแล้ว ขาแข็งแรงมาก`);
  if(streak()>=3) L.push(`เราอยู่ด้วยกันมา ${streak()} วันติดแล้วนะ`);
  const lw=lastWorkoutAgo(); if(!d.workouts.length&&(lw===null||lw>=3)) L.push('ไปขยับตัวด้วยกันไหม แค่ 10 นาทีก็นับ');
  return L;
}
function mood(){
  const tp=timePose(), x=dayXP(dk()), L=petLines();
  if(tp==='night') return ['sleep',x>=30?'ง่วงแล้ว... วันนี้ทำดีมาก ฝันดีนะ':'ง่วงจัง... พรุ่งนี้มาเริ่มใหม่ด้วยกันนะ','snooze'];
  if(qDoneOn(dk())===3) return ['happy',L[0],'party'];
  if(tp==='morning'&&x<15) return ['neutral','อ๊าาา บิดขี้เกียจก่อน... อรุณสวัสดิ์! เริ่มจากมื้อเช้าที่มีโปรตีนกัน','stretch'];
  if(!active(S.days[ago(1)])&&!active(S.days[ago(2)])&&x<15) return ['sleepy','คิดถึงจัง กลับมาแล้วดีใจนะ',''];
  if(x>=15&&L.length) return ['happy',L[0],''];
  return ['neutral',L[0]||'ยังมีเวลา มาทำภารกิจกัน',''];
}
function autoMeal(){if(!isToday())return 'd';const h=new Date().getHours();return h<10?'b':h<15?'l':h<21?'d':'s'}

/* adaptive calorie target: compares what was eaten with how weight actually moved */
function adaptive(){
  const T=S.profile, ks=[...Array(21)].map((_,i)=>ago(i));
  const logged=ks.filter(k=>S.days[k]&&new Set(S.days[k].foods.map(f=>f.meal)).size>=2);
  const ws=S.weights.filter(w=>w.d>=ago(20)).sort((a,b)=>a.d<b.d?-1:1);
  const span=ws.length>1?(pd(ws[ws.length-1].d)-pd(ws[0].d))/864e5:0;
  const needLog=Math.max(0,10-logged.length), needW=Math.max(0,3-ws.length);
  const ready=!needLog&&!needW&&span>=10;
  if(!ready) return {ready,needLog,needW,span,progress:Math.min(1,(Math.min(logged.length,10)+Math.min(ws.length,3)*2)/16)};
  const xs=ws.map(w=>(pd(w.d)-pd(ws[0].d))/864e5), ys=ws.map(w=>w.kg);
  const mx=xs.reduce((a,b)=>a+b)/xs.length, my=ys.reduce((a,b)=>a+b)/ys.length;
  const slope=xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0)/xs.reduce((a,x)=>a+(x-mx)**2,0);
  const intake=logged.reduce((a,k)=>a+totals(S.days[k]).kcal,0)/logged.length;
  const tdee=Math.round((intake-slope*7700)/10)*10;
  let target=T.goal<T.weight?tdee-400:tdee;
  target=Math.max(T.kcal-300,Math.min(T.kcal+300,target));
  target=Math.max(target,T.sex==='m'?1500:1200); target=Math.round(target/10)*10;
  return {ready,tdee,intake:Math.round(intake),rate:r1(-slope*7),target,diff:target-T.kcal,days:logged.length};
}
const adaptPending=()=>{const a=adaptive();return a.ready&&Math.abs(a.diff)>=80&&!(S.adaptSeen&&S.adaptSeen>ago(7))?a:null};

/* ================= cat ================= */
function catSVG(o={}){
  const lv=o.lv??levelOf(totalXP()), md=o.md??'happy', eq=o.eq||S.pet.equip, K=SKINS[eq.skin]||SKINS.orange;
  const s=lv>=10?1:lv>=5?.9:.8;
  const eyes=md==='happy'
    ?`<path d="M76 80q8-9 16 0M108 80q8-9 16 0" stroke="${K.eye}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    :md==='sleep'
    ?`<path d="M76 79q8 6 16 0M108 79q8 6 16 0" stroke="${K.eye}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    :md==='sleepy'
    ?`<path d="M76 82h16M108 82h16" stroke="${K.eye}" stroke-width="4" stroke-linecap="round"/>`
    :`<g class="eyes"><circle cx="84" cy="79" r="6" fill="${K.eye}"/><circle cx="116" cy="79" r="6" fill="${K.eye}"/><circle cx="86" cy="77" r="2" fill="#fff"/><circle cx="118" cy="77" r="2" fill="#fff"/></g>`;
  const blush=md!=='sleepy'?'<ellipse cx="70" cy="93" rx="8" ry="4.5" fill="#F27E7E" opacity=".45"/><ellipse cx="130" cy="93" rx="8" ry="4.5" fill="#F27E7E" opacity=".45"/>':'';
  const scarf=lv>=3?'<path d="M62 112q38 16 76 0v11q-38 16-76 0z" fill="#D2463A"/><path d="M118 122l10 26-12 2-6-24z" fill="#B83A30"/>':'';
  const HEAD={
   bow:'<g transform="translate(130 42)"><path d="M0 0l-15-10v20zM0 0l15-10v20z" fill="#F06B9B"/><circle r="5" fill="#D94F7A"/></g>',
   flower:'<g transform="translate(66 46)"><circle cx="0" cy="-7" r="5" fill="#fff"/><circle cx="7" cy="-2" r="5" fill="#fff"/><circle cx="4" cy="6" r="5" fill="#fff"/><circle cx="-4" cy="6" r="5" fill="#fff"/><circle cx="-7" cy="-2" r="5" fill="#fff"/><circle r="4.5" fill="#F5C443"/></g>',
   cap:'<path d="M58 58q42-46 84 0z" fill="#E0663F"/><path d="M128 55q26 1 32 8q-16 3-33-2z" fill="#B84E2D"/><circle cx="100" cy="22" r="4" fill="#B84E2D"/>',
   beanie:'<path d="M56 62q44-54 88 0z" fill="#5B8DEF"/><rect x="54" y="54" width="92" height="13" rx="6.5" fill="#3E6FD3"/><circle cx="100" cy="20" r="9" fill="#F4F4F4"/>',
   headphones:'<path d="M56 78q0-52 44-52t44 52" stroke="#2E3440" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="47" y="68" width="16" height="24" rx="7" fill="#4FC2D8"/><rect x="137" y="68" width="16" height="24" rx="7" fill="#4FC2D8"/>',
   crown:'<path d="M72 46l6-24 12 14 10-20 10 20 12-14 6 24z" fill="#F5C443" stroke="#D9A21E" stroke-width="2.5" stroke-linejoin="round"/><circle cx="100" cy="36" r="3.5" fill="#E0663F"/>'};
  const head=eq.head&&HEAD[eq.head]?HEAD[eq.head]:(lv>=5?'<path d="M60 60q40-22 80 0" stroke="#3E6FD3" stroke-width="9" fill="none" stroke-linecap="round"/>':'');
  const face=eq.face==='glasses'?'<g><rect x="69" y="71" width="27" height="17" rx="8" fill="#22242A"/><rect x="104" y="71" width="27" height="17" rx="8" fill="#22242A"/><rect x="95" y="76" width="10" height="3" fill="#22242A"/><path d="M74 75h8" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/></g>':'';
  const db=lv>=8?'<g transform="translate(150 150)"><rect x="-2" y="6" width="34" height="5" rx="2" fill="#6B7570"/><rect x="-8" y="0" width="8" height="17" rx="2" fill="#3C4642"/><rect x="30" y="0" width="8" height="17" rx="2" fill="#3C4642"/></g>':'';
  const zz=md==='sleep'?'<g fill="var(--muted)" font-family="Mitr,sans-serif" font-weight="600"><text class="zz" x="148" y="40" font-size="16">z</text><text class="zz" x="160" y="26" font-size="12" style="animation-delay:.9s">z</text></g>':'';
  return `<svg class="cat" viewBox="0 0 200 180" role="img" aria-label="น้องแมว ${esc(S.pet.name)}">
  <g transform="translate(100 172) scale(${s}) translate(-100 -172)"><g class="bob">
  <path class="tail" d="M148 146q40-6 34-52" stroke="${K.tail}" stroke-width="13" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="134" rx="54" ry="38" fill="${K.b}"/>
  <ellipse cx="100" cy="144" rx="31" ry="23" fill="${K.bl}"/>
  <ellipse cx="78" cy="168" rx="15" ry="8" fill="${K.b}"/><ellipse cx="122" cy="168" rx="15" ry="8" fill="${K.b}"/>
  ${scarf}
  <path d="M60 58l4-38 30 22z" fill="${K.b}"/><path d="M140 58l-4-38-30 22z" fill="${K.b}"/>
  <path d="M66 50l3-20 15 12z" fill="${K.ear}"/><path d="M134 50l-3-20-15 12z" fill="${K.ear}"/>
  <circle cx="100" cy="80" r="46" fill="${K.b}"/>
  <path d="M90 38q10 7 20 0M84 46q16 9 32 0" stroke="${K.st}" stroke-width="4" fill="none" stroke-linecap="round"/>
  ${head}${eyes}${face}${blush}
  <path d="M95 90l5 5 5-5z" fill="#DE7777"/>
  <path d="M91 99q4.5 5 9 0q4.5 5 9 0" stroke="${eq.skin==='black'?'#C9C9D2':'#3A2A20'}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M58 90l-18-3M58 97l-17 4M142 90l18-3M142 97l17 4" stroke="${K.wh}" stroke-width="2" stroke-linecap="round"/>
  </g>${db}</g>${zz}</svg>`;
}
const bossSVG='<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="40" rx="24" ry="18" fill="#8E7CC3"/><ellipse cx="32" cy="44" rx="15" ry="10" fill="#B9ACE0"/><path d="M14 30q-4-14 6-16M50 30q4-14-6-16" stroke="#8E7CC3" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M22 36h8M34 36h8" stroke="#2A2340" stroke-width="3" stroke-linecap="round"/><path d="M28 46q4 2 8 0" stroke="#2A2340" stroke-width="2.5" fill="none" stroke-linecap="round"/><text x="46" y="20" font-size="10" font-weight="700" fill="#8E7CC3">z</text><text x="52" y="12" font-size="8" font-weight="700" fill="#8E7CC3">z</text></svg>';

/* ================= icons ================= */
const sv=(p,w=24,fill='none')=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="${fill}" stroke="${fill==='none'?'currentColor':'none'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
 today:sv('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
 food:sv('<path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/>'),
 food22:sv('<path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/>',22),
 train:sv('<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>'),
 train22:sv('<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',22),
 body:sv('<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M8 10a5 5 0 0 1 8 0M12 10l1.5-2"/>'),
 pet:sv('<ellipse cx="7" cy="9" rx="2" ry="2.6"/><ellipse cx="12" cy="6.5" rx="2" ry="2.6"/><ellipse cx="17" cy="9" rx="2" ry="2.6"/><path d="M12 11c3 0 5.5 3.3 5.5 5.6 0 1.8-1.6 2.4-3 2.4-1 0-1.7-.5-2.5-.5s-1.5.5-2.5.5c-1.4 0-3-.6-3-2.4C6.5 14.3 9 11 12 11z"/>',24,'currentColor'),
 flame:sv('<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/>',15,'currentColor'),
 flame22:sv('<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z"/>',22,'currentColor'),
 coin:sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/>',15),
 bulb:sv('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',20),
 check:sv('<path d="M5 12l5 5 9-10"/>',14),
 drop:sv('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',18),
 shoe:sv('<path d="M3 17h17a1 1 0 0 0 1-1c0-2-2-3-4-3l-3-1-2-4H6L4 12l-1 5z"/><path d="M3 20h18"/>',18),
 moon:sv('<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',18),
 starO:sv('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',20),
 starF:sv('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',20,'currentColor'),
 bolt:sv('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',22),
 sword:sv('<path d="M14 4h6v6L9 21l-6-6zM5 13l6 6M3 21l3-3"/>',22),
 leaf:sv('<path d="M5 19c0-9 6-14 15-15-1 9-6 15-15 15zM5 19l7-7"/>',22),
 star:sv('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',22),
 scale:sv('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 10a4 4 0 0 1 6 0M12 10l1-1.5"/>',18),
 timer:sv('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',18),
 chev:sv('<path d="M6 9l6 6 6-6"/>',20),
 heart:sv('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',18),
 share:sv('<path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',18),
 spark:sv('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',20)};
const TABS=[['today','วันนี้'],['food','อาหาร'],['train','ออกกำลัง'],['body','ร่างกาย'],['pet','น้องแมว']];

/* ================= advice ================= */
function advice(){
  const T=S.profile, t=totals(day()), R=T.kcal-t.kcal, P=T.protein-t.p, h=isToday()?new Date().getHours():23;
  let msg;
  if(t.kcal===0) msg=isToday()?'เริ่มวันด้วยมื้อเช้าที่มีโปรตีน เช่น ไข่ต้มหรือโยเกิร์ต จะอิ่มนานถึงเที่ยง':'วันนี้ยังไม่มีบันทึก เติมย้อนหลังได้เลย จำได้เท่าไหร่ใส่เท่านั้นก็พอ';
  else if(R<0) msg=`${isToday()?'วันนี้':'วันนั้น'}เกินเป้ามา ${fmt(-R)} kcal ไม่เป็นไรเลย วันเดียวไม่ทำให้อ้วน เดินเพิ่มสัก 20 นาที แล้วเริ่มใหม่`;
  else if(h>=19&&t.kcal<T.kcal*.6) msg='กินน้อยไปหน่อย กินน้อยเกินไปทำให้เผาผลาญช้าลงและหิวหนักวันถัดไป มื้อเย็นกินให้ครบนะ';
  else if(P>15&&P*10>R*.6) msg=`ยังขาดโปรตีนอีก ${fmt(P)} g เลือกเมนูโปรตีนสูงจะคุ้มแคลที่สุด`;
  else msg=`เหลือ ${fmt(R)} kcal กับโปรตีน ${fmt(Math.max(P,0))} g ลองเมนูพวกนี้`;
  const pool=allFoods().filter(f=>!f.tags.includes('sweet')&&f.kcal<=Math.max(R,160)+40&&f.kcal>=50);
  const picks=pool.map(f=>({f,sc:f.p/f.kcal*100+(P>15?f.p*.4:0)+(f.tags.includes('veg')?3:0)+(S.favs.includes(f.id)?4:0)})).sort((a,b)=>b.sc-a.sc).slice(0,3).map(x=>x.f);
  return {msg,picks};
}

/* ================= views ================= */
const bar=(v,t,c)=>`<div class="bar"><i style="width:${t?Math.min(v/t,1)*100:0}%;background:${c}"></i></div>`;
function dateBar(){
  const wd=['อา','จ','อ','พ','พฤ','ศ','ส'];
  return `<div class="datebar" id="datebar" role="tablist" aria-label="เลือกวัน">${[...Array(14)].map((_,i)=>{const k=ago(13-i),d=pd(k),has=S.days[k]&&(S.days[k].foods.length||S.days[k].workouts.length);
    return `<button class="dchip ${k===CUR?'on':''} ${has?'has':''}" data-act="day" data-k="${k}" role="tab" aria-selected="${k===CUR}" aria-label="${thDate(k)}"><span>${i===13?'วันนี้':wd[d.getDay()]}</span><b class="num">${d.getDate()}</b><i></i></button>`}).join('')}</div>`;
}
const pastBanner=()=>isToday()?'':`<div class="past"><span style="flex:1">กำลังแก้ไข <b>${thDate(CUR)}</b> เติมของที่ลืมได้เลย</span><button class="btn small" data-act="day" data-k="${dk()}">กลับวันนี้</button></div>`;
function stageHTML(){
  const xp=totalXP(), L=levelInfo(xp), [md,txt,anim]=mood(), qd=qDoneOn(dk());
  return `<section class="stage card" aria-label="น้องแมว">
   <button class="petbtn ${anim}" data-act="petTap" aria-label="คุยกับน้องแมว">${catSVG({lv:L.lv,md})}</button>
   <div class="stage-meta"><div class="bubble" id="bubble">${txt}</div>
    <div class="badges"><span class="mini">${esc(S.pet.name)} · Lv ${L.lv}</span><span class="mini num">${IC.flame} ${streak()} วัน</span><span class="mini num">${IC.coin} ${fmt(coins())}</span><span class="mini num ${qd===3?'qchip':''}">ภารกิจ ${qd}/3</span></div></div>
   <div class="lvbar" aria-label="EXP ${L.cur} จาก ${L.need}"><i style="width:${L.cur/L.need*100}%"></i></div></section>`;
}
function vToday(){
  const T=S.profile, d=day(), t=totals(d), R=T.kcal-t.kcal, over=R<0, today=isToday();
  const C1=2*Math.PI*56, C2=2*Math.PI*42, p1=Math.min(t.kcal/T.kcal,1), p2=Math.min(t.p/T.protein,1);
  const adv=advice(), qs=questsFor(CUR), lw=lastWorkoutAgo(), nx=sessionInfo(S.program.done);
  const favs=S.favs.map(foodById).filter(Boolean), qd=qs.filter(q=>q.ok(d,t,T)).length;
  const comeback=lw===null||lw>=3, wk=weekOf(CUR), dead=wk>=T.wpw, ad=today&&adaptPending();
  return `
  <header class="top"><div><div class="eyebrow">${thDate(CUR)}</div><h1>${today?'วันนี้ค่อย ๆ ไปทีละนิด':'ย้อนดูวันก่อน'}</h1></div></header>
  ${dateBar()}${pastBanner()}
  ${today&&isIOS()&&!isInstalled()&&!S.installHide?`<div class="banner"><div style="flex:1"><b>ติดตั้ง PawFit ลงหน้าจอโฮม</b> จะเปิดเต็มจอ ใช้ออฟไลน์ได้ และข้อมูลไม่หาย</div><button class="btn small" data-act="installHelp">วิธีติดตั้ง</button></div>`:''}
  ${S.example&&today&&!(isIOS()&&!isInstalled()&&!S.installHide)?`<div class="banner"><div style="flex:1">ตอนนี้เป็น<b>ข้อมูลตัวอย่าง</b> ลองกดเล่นได้เลย</div><button class="btn small" data-act="onboard">เริ่มของฉัน</button></div>`:''}
  ${ad&&!S.example?`<div class="banner"><span style="flex:1">ผู้ช่วยปรับเป้ามีคำแนะนำใหม่ เป้าแคลที่ตรงกับร่างกายเธอมากขึ้น</span><button class="btn small" data-tab="body">ดูเลย</button></div>`:''}
  ${today?stageHTML():''}
  <section class="card quick" aria-label="ทางลัด"><div class="row-between"><h2>แตะเดียวบันทึก</h2><button class="chip" data-act="add" data-meal="${autoMeal()}">+ เมนูอื่น</button></div>
   <div class="chips">${favs.map(f=>`<button class="fav" data-act="quick" data-id="${f.id}">${foodImg(f.art,32)}<span>${esc(f.name)} <span class="k num">${f.kcal}</span></span><span class="p" aria-hidden="true">+</span></button>`).join('')||'<span class="small muted">กดดาวในหน้าเพิ่มอาหาร เพื่อตั้งเมนูประจำ</span>'}</div>
   <div class="tiles">
    <div class="tile" role="group" aria-label="น้ำ"><span class="ic" style="background:color-mix(in srgb,var(--water) 16%,transparent);color:var(--water)">${IC.drop}</span><b class="num">${d.water}<span class="muted" style="font-size:13px">/${T.water}</span></b><span>แก้วน้ำ</span>${bar(d.water,T.water,'var(--water)')}<button class="tp" data-act="water" data-d="1" aria-label="ดื่มน้ำเพิ่ม 1 แก้ว">+</button></div>
    <button class="tile" data-act="steps"><span class="ic" style="background:color-mix(in srgb,var(--steps) 16%,transparent);color:var(--steps)">${IC.shoe}</span><b class="num">${fmt(d.steps)}</b><span>/ ${fmt(T.steps)} ก้าว</span>${bar(d.steps,T.steps,'var(--steps)')}</button>
    <button class="tile" data-act="sleep"><span class="ic" style="background:color-mix(in srgb,var(--sleep) 16%,transparent);color:var(--sleep)">${IC.moon}</span><b class="num">${d.sleep||'–'}<span class="muted" style="font-size:13px"> ชม.</span></b><span>นอน · เป้า ${T.sleep}</span>${bar(d.sleep,T.sleep,'var(--sleep)')}</button>
   </div>
   <div class="btns"><button class="btn ghost small" data-act="weigh">${IC.scale} ชั่งน้ำหนัก</button><button class="btn ghost small" data-act="mini">${IC.timer} 10 นาที</button></div>
   <button class="btn ghost small" data-act="health">${IC.heart} ดึงก้าว การนอน น้ำหนัก จาก Apple Health</button></section>
  <section class="card hero tint-kcal" aria-label="สรุปแคลอรี">
   <div class="ring"><svg viewBox="0 0 136 136"><circle cx="68" cy="68" r="56" fill="none" stroke="color-mix(in srgb,var(--kcal) 14%,transparent)" stroke-width="11"/><circle cx="68" cy="68" r="56" fill="none" stroke="${over?'var(--warn)':'var(--kcal)'}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C1}" stroke-dashoffset="${C1*(1-p1)}"/>
    <circle cx="68" cy="68" r="42" fill="none" stroke="color-mix(in srgb,var(--prot) 14%,transparent)" stroke-width="9"/><circle cx="68" cy="68" r="42" fill="none" stroke="var(--prot)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C2}" stroke-dashoffset="${C2*(1-p2)}"/></svg>
    <div class="c"><span class="lab">${over?'เกินมา':'เหลือ'}</span><span class="big num">${fmt(Math.abs(R))}</span><span class="lab">kcal</span></div></div>
   <div class="macros">
    <div class="mac"><div class="row-between"><span><i class="dotl" style="background:var(--kcal)"></i>แคลอรี</span><span class="num muted">${fmt(t.kcal)}/${fmt(T.kcal)}</span></div></div>
    <div class="mac"><div class="row-between"><span><i class="dotl" style="background:var(--prot)"></i>โปรตีน</span><span class="num muted">${fmt(t.p)}/${T.protein} g</span></div></div>
    <div class="mac"><div class="row-between"><span><i class="dotl" style="background:var(--carb)"></i>คาร์บ</span><span class="num muted">${fmt(t.c)} g</span></div></div>
    <div class="mac"><div class="row-between"><span><i class="dotl" style="background:var(--fat)"></i>ไขมัน</span><span class="num muted">${fmt(t.f)} g</span></div></div>
   </div></section>
  <section class="card tint-sun"><h2>${today?'ควรกินอะไรต่อดี':'เติมเมนูที่ลืม'}</h2><p class="muted small">${adv.msg}</p>
   <div class="reco">${adv.picks.map(f=>`<button class="reco-item" data-act="quick" data-id="${f.id}">${foodImg(f.art,52)}<span class="n"><b>${esc(f.name)}</b><span class="pill p">โปรตีน ${r1(f.p)} g</span> <span class="pill num">${f.kcal} kcal</span></span><span class="plus" aria-hidden="true">+</span></button>`).join('')}</div></section>
  ${today?(comeback?`<section class="card comeback"><span class="eyebrow">${lw===null?'ยังไม่เคยเริ่ม':`ห่างจากการออกกำลังมา ${lw} วัน`}</span><h2>ไม่เป็นไรเลย กลับมาแบบเบา ๆ กัน</h2>
    <p class="muted small">ครั้งถัดไป: ${nx.title} · ${nx.min} นาที หรือวันนี้ขอแค่ 10 นาทีก็นับแล้ว</p>
    <div class="btns"><button class="btn" data-act="session">เริ่ม ${nx.title}</button><button class="btn ghost" data-act="mini">แค่ 10 นาที</button></div></section>`
   :`<section class="card"><div class="row-between"><h2>ออกกำลังครั้งถัดไป</h2><span class="pill">สัปดาห์ ${nx.week}</span></div><p class="muted small">${nx.title} · ${nx.min} นาที</p><button class="btn block" data-act="session">เริ่มเลย</button></section>`)
   :`<section class="card"><h2>ลืมบันทึกออกกำลังวันนั้น?</h2><div class="btns"><button class="btn ghost" data-act="finish">${nx.title} ครั้งที่ ${nx.i+1}</button><button class="btn ghost" data-act="finishMini">10 นาที</button><button class="btn ghost" data-act="finishStretch">ยืดเหยียด</button></div></section>`}
  <details class="card" id="moreBox" ${MORE_OPEN?'open':''}><summary><span><b style="font-family:var(--f-display);font-weight:500;font-size:17px">ภารกิจและบอสสัปดาห์</b> <span class="pill num">${qd}/3</span></span><span class="chev">${IC.chev}</span></summary>
   <div class="more-in">
    <div style="display:flex;flex-direction:column;gap:6px">${qs.map(q=>{const ok=q.ok(d,t,T);return `<div class="quest ${ok?'done':''}"><span class="check">${ok?IC.check:''}</span><span>${q.t(T)}</span></div>`}).join('')}
     <span class="small muted">ข้อละ +10 EXP ครบ 3 ข้อรับโบนัสอีก +15</span></div>
    <div class="boss ${dead?'dead':''}">${bossArt()}<div style="display:flex;flex-direction:column;gap:6px;min-width:0"><div class="row-between"><b style="font-family:var(--f-display);font-weight:500">เจ้าขี้เกียจประจำสัปดาห์</b><span class="small muted num">${Math.min(wk,T.wpw)}/${T.wpw}</span></div>
     <div class="hp">${Array.from({length:T.wpw},(_,i)=>`<i class="${i<wk?'hit':''}"></i>`).join('')}</div>
     <span class="small muted">${dead?'ปราบได้แล้ว! รับโบนัส +30 EXP':`ออกกำลังอีก ${T.wpw-wk} ครั้งภายในวันอาทิตย์ เพื่อปราบมัน`}</span></div></div>
    <div class="tip"><span class="ic">${IC.bulb}</span><div><b>เกร็ดวันนี้</b><div class="small">${TIPS[pd(CUR).getDate()%TIPS.length]}</div></div></div>
   </div></details>`;
}
let MORE_OPEN=false;
function vFood(){
  const T=S.profile,d=day(),t=totals(d);
  return `<header class="top"><div><div class="eyebrow">อาหาร · ${thDate(CUR)}</div><h1 class="num">${fmt(t.kcal)} <span class="muted" style="font-size:16px">/ ${fmt(T.kcal)} kcal</span></h1></div><button class="chip" data-act="goals">ปรับเป้า</button></header>
  ${dateBar()}${pastBanner()}
  <section class="card"><div class="stats">
   <div class="stat"><b class="num" style="color:var(--prot)">${fmt(t.p)} g</b><span>โปรตีน · เป้า ${T.protein}</span>${bar(t.p,T.protein,'var(--prot)')}</div>
   <div class="stat"><b class="num" style="color:var(--carb)">${fmt(t.c)} g</b><span>คาร์บ</span></div>
   <div class="stat"><b class="num" style="color:var(--fat)">${fmt(t.f)} g</b><span>ไขมัน</span></div></div></section>
  ${MEALS.map(([m,lab])=>{const items=d.foods.map((x,i)=>({x,i})).filter(o=>o.x.meal===m);const mk=items.reduce((a,o)=>a+o.x.kcal*o.x.qty,0);
   return `<section class="card meal"><h3>${lab}<span class="num muted small">${fmt(mk)} kcal</span></h3>
   ${items.length?items.map(({x,i})=>`<div class="frow">${foodImg(x.art||(FOODS.find(f=>f.name===x.name)||{}).art,40)}<div class="n"><b>${esc(x.name)}</b><span class="small muted num">โปรตีน ${r1(x.p*x.qty)} g</span></div>
    <div class="qty"><button data-act="qty" data-i="${i}" data-d="-0.5" aria-label="ลดปริมาณ ${esc(x.name)}">−</button><span class="num">×${x.qty}</span><button data-act="qty" data-i="${i}" data-d="0.5" aria-label="เพิ่มปริมาณ ${esc(x.name)}">+</button></div><div class="k num">${fmt(x.kcal*x.qty)}</div></div>`).join(''):`<div class="empty emptyart">${foodImg('empty_plate',40)}<span>ยังไม่มีรายการ แตะปุ่มด้านล่างเพื่อเพิ่ม</span></div>`}
   <button class="btn ghost small" data-act="add" data-meal="${m}">+ เพิ่มมื้อ${lab}</button></section>`}).join('')}
  <section class="card"><h2>กินนอกบ้าน สั่งแบบนี้เบาลง</h2>${SWAPS.map(s=>`<div class="swap"><s>${s[0]}</s><span class="save num">${s[2]}</span><span>${s[1]}</span></div>`).join('')}</section>`;
}
function vTrain(){
  const T=S.profile, done=S.program.done, nx=sessionInfo(done), lw=lastWorkoutAgo(), cb=lw===null||lw>=3;
  const hist=[];for(let i=0;i<60&&hist.length<5;i++){const d=S.days[ago(i)];if(d)d.workouts.forEach(w=>hist.push({...w,ago:i}))}
  const up=[0,1,2,3].map(j=>sessionInfo(done+j));
  return `<header class="top"><div><div class="eyebrow">โปรแกรมกลับมาเริ่มใหม่ · รอบที่ ${nx.round}</div><h1>เวท + คาร์ดิโอ</h1></div><span class="chip num">${weekOf(dk())}/${T.wpw} สัปดาห์นี้</span></header>
  <section class="card ${cb?'comeback':''}"><span class="eyebrow">ครั้งที่ ${nx.i+1} จาก ${TOTAL_SESS} · สัปดาห์ ${nx.week}</span><h2>${nx.title} · ${nx.min} นาที</h2>
   <p class="small muted">นับเป็น "ครั้ง" ไม่ผูกกับวัน พลาดวันไหนก็แค่ทำครั้งถัดไป ไม่ต้องเริ่มนับใหม่</p>
   <div class="btns"><button class="btn" data-act="session">เริ่มครั้งนี้</button><button class="btn ghost" data-act="mini">ไม่มีแรง ขอ 10 นาที</button></div></section>
  <section class="card"><div class="row-between"><h2>ความคืบหน้า</h2><span class="num muted small">${nx.i}/${TOTAL_SESS}</span></div>
   <div class="dots">${Array.from({length:TOTAL_SESS},(_,i)=>{const s=sessionInfo(i);return `<span class="dot ${i<nx.i?'done':i===nx.i?'next':''}" title="${s.title}">${s.type}</span>`}).join('')}</div>
   <p class="small muted">A, B = เวทเต็มตัว · C = คาร์ดิโอ · เว้นเวทอย่างน้อยหนึ่งวัน</p></section>
  <section class="card"><h2>ต่อจากนี้</h2>${up.map(s=>`<div class="sess"><span class="tag ${s.type}">${s.type}</span><div style="flex:1"><b style="font-weight:500">${s.title}</b><div class="small muted">สัปดาห์ ${s.week} · ${s.min} นาที${s.type!=='C'?` · ${REPS[s.week-1][0]} เซต × ${REPS[s.week-1][1]} ครั้ง`:''}</div></div></div>`).join('')}</section>
  <section class="card"><h2>เสริมได้ทุกวัน</h2>
   <div class="sess"><span class="tag M">10</span><div style="flex:1"><b style="font-weight:500">10 นาทีวันขี้เกียจ</b><div class="small muted">5 ท่า ไม่ใช้อุปกรณ์ นับเป็นการออกกำลัง</div></div><button class="btn small" data-act="mini">เริ่ม</button></div>
   <div class="sess"><span class="tag S">5</span><div style="flex:1"><b style="font-weight:500">ยืดเหยียดหลังเลิกงาน</b><div class="small muted">คอ ไหล่ หลัง สะโพก สำหรับคนนั่งนาน</div></div><button class="btn small" data-act="stretch">เริ่ม</button></div></section>
  <section class="card flat tip"><span class="ic">${IC.bulb}</span><div><b>ทำไมต้องเวทด้วย</b><div class="small">ตอนลดน้ำหนัก ถ้าไม่เล่นเวท ร่างกายจะเสียกล้ามเนื้อไปด้วย หุ่นจะดูไม่กระชับ เวทสัปดาห์ละ 2 ครั้งช่วยรักษากล้ามเนื้อ ส่วนคาร์ดิโอใช้เดินเร็ว ปั่นจักรยาน หรือเต้นแอโรบิกแทนกันได้</div></div></section>
  <section class="card"><h2>ประวัติล่าสุด</h2>${hist.length?hist.map(w=>`<div class="sess"><span class="tag ${w.kind}">${w.kind}</span><div style="flex:1"><b style="font-weight:500">${esc(w.name)}</b><div class="small muted">${w.ago===0?'วันนี้':w.ago+' วันก่อน'} · ${w.min} นาที</div></div></div>`).join(''):'<div class="empty">ยังไม่มีประวัติ</div>'}</section>`;
}
function chartSVG(list,unit){
  const W=list.slice().sort((a,b)=>a.d<b.d?-1:1).slice(-14);
  if(W.length<2) return '<div class="empty">บันทึกอย่างน้อย 2 ครั้งเพื่อดูกราฟ</div>';
  const w=340,h=170,L=38,Rr=12,Tp=18,B=26, ks=W.map(x=>x.v);
  const mn=Math.floor(Math.min(...ks)*2)/2-.5, mx=Math.ceil(Math.max(...ks)*2)/2+.5;
  const t0=pd(W[0].d).getTime(), t1=pd(W[W.length-1].d).getTime();
  const X=d=>L+(pd(d).getTime()-t0)/((t1-t0)||1)*(w-L-Rr), Y=k=>Tp+(mx-k)/(mx-mn)*(h-Tp-B);
  const pts=W.map(x=>[X(x.d),Y(x.v)]), line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const lab=d=>{const x=pd(d);return x.getDate()+'/'+(x.getMonth()+1)}, last=pts[pts.length-1];
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="กราฟ ${unit}">
   <defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--leaf)" stop-opacity=".28"/><stop offset="1" stop-color="var(--leaf)" stop-opacity="0"/></linearGradient></defs>
   ${[mn,(mn+mx)/2,mx].map(k=>`<line x1="${L}" x2="${w-Rr}" y1="${Y(k)}" y2="${Y(k)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L-6}" y="${Y(k)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${r1(k)}</text>`).join('')}
   <path d="${line} L${last[0]} ${h-B} L${pts[0][0]} ${h-B}Z" fill="url(#gA)"/>
   <path d="${line}" fill="none" stroke="var(--leaf)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
   ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i===pts.length-1?5.5:3}" fill="${i===pts.length-1?'var(--leaf)':'var(--surface)'}" stroke="var(--leaf)" stroke-width="2"/>`).join('')}
   <text x="${Math.min(last[0],w-Rr)}" y="${Math.max(last[1]-11,12)}" text-anchor="end" font-size="12" font-weight="600" fill="var(--ink)">${r1(W[W.length-1].v)} ${unit}</text>
   <text x="${L}" y="${h-6}" font-size="11" fill="var(--muted)">${lab(W[0].d)}</text><text x="${w-Rr}" y="${h-6}" font-size="11" text-anchor="end" fill="var(--muted)">${lab(W[W.length-1].d)}</text></svg>`;
}
function weekly(){
  const T=S.profile, ks=[6,5,4,3,2,1,0].map(ago);
  const rows=ks.map(k=>{const d=S.days[k],t=totals(d);return {k,d,t,logged:!!(d&&d.foods.length)}});
  const lg=rows.filter(r=>r.logged);
  const avg=lg.length?lg.reduce((a,r)=>a+r.t.kcal,0)/lg.length:0;
  const pHit=rows.filter(r=>r.logged&&r.t.p>=T.protein*.9).length;
  const inR=rows.filter(r=>r.logged&&r.t.kcal>=T.kcal*.85&&r.t.kcal<=T.kcal*1.05).length;
  const wo=rows.reduce((a,r)=>a+(r.d?r.d.workouts.length:0),0);
  const stp=rows.filter(r=>r.d&&r.d.steps);const stepsAvg=stp.length?stp.reduce((a,r)=>a+r.d.steps,0)/stp.length:0;
  let focus;
  if(lg.length<4) focus='ลองบันทึกอาหารให้ได้ 5 วันขึ้นไป จะเห็นภาพชัดขึ้นมาก';
  else if(pHit<3) focus='สัปดาห์หน้าโฟกัสโปรตีน ลองเพิ่มไข่ต้มหรืออกไก่ในมื้อเช้า';
  else if(wo<T.wpw) focus=`ออกกำลังให้ได้ ${T.wpw} ครั้ง เริ่มจาก 10 นาทีก็ได้`;
  else focus='สัปดาห์นี้ดีมาก รักษาจังหวะนี้ไว้';
  const lab=['อา','จ','อ','พ','พฤ','ศ','ส'];
  return `<section class="card"><h2>สรุป 7 วันที่ผ่านมา</h2>
   <div class="week">${rows.map(r=>{const ok=r.logged&&r.t.p>=T.protein*.9&&r.t.kcal<=T.kcal*1.05;return `<div style="display:flex;flex-direction:column;gap:4px"><span>${lab[pd(r.k).getDay()]}</span><span class="d num ${ok?'ok':r.logged?'half':''}">${pd(r.k).getDate()}</span></div>`}).join('')}</div>
   <div class="stats"><div class="stat"><b class="num">${fmt(avg)}</b><span>kcal เฉลี่ย/วัน</span></div><div class="stat"><b class="num">${pHit}/7</b><span>วันโปรตีนถึงเป้า</span></div><div class="stat"><b class="num">${wo}/${T.wpw}</b><span>ครั้งออกกำลัง</span></div>
   <div class="stat"><b class="num">${inR}/7</b><span>วันแคลพอดี</span></div><div class="stat"><b class="num">${fmt(stepsAvg)}</b><span>ก้าวเฉลี่ย</span></div><div class="stat"><b class="num">${streak()}</b><span>วันติดต่อกัน</span></div></div>
   <div class="banner"><span>${focus}</span></div></section>`;
}
function adaptCard(){
  const a=adaptive(), T=S.profile;
  if(!a.ready) return `<section class="card adapt"><div class="row-between"><h2>ผู้ช่วยปรับเป้า</h2><span class="pill">กำลังเรียนรู้</span></div>
   <p class="small muted">สูตรคำนวณแคลคลาดเคลื่อนได้ 10–20% แอปจะเทียบสิ่งที่กินกับน้ำหนักจริง แล้วหาเป้าที่ตรงกับร่างกายเธอ</p>
   ${bar(a.progress,1,'var(--leaf)')}<span class="small">${[a.needLog?`บันทึกอาหารอีก ${a.needLog} วัน`:'',a.needW?`ชั่งน้ำหนักอีก ${a.needW} ครั้ง`:'',!a.needLog&&!a.needW?'ชั่งน้ำหนักต่อไปให้ห่างกันอย่างน้อย 10 วัน':''].filter(Boolean).join(' และ ')} เพื่อปลดล็อก</span></section>`;
  const fit=Math.abs(a.diff)<80;
  return `<section class="card adapt"><div class="row-between"><h2>ผู้ช่วยปรับเป้า</h2><span class="pill">${a.days} วันล่าสุด</span></div>
   <div class="stats"><div class="stat"><b class="num">${fmt(a.intake)}</b><span>กินเฉลี่ย kcal/วัน</span></div><div class="stat"><b class="num">${a.rate>=0?'−':'+'}${Math.abs(a.rate)}</b><span>กก./สัปดาห์ (จริง)</span></div><div class="stat"><b class="num">${fmt(a.tdee)}</b><span>ร่างกายใช้จริง</span></div></div>
   ${fit?`<p class="small">เป้าตอนนี้ ${fmt(T.kcal)} kcal พอดีกับร่างกายแล้ว ทำต่อแบบนี้ได้เลย</p>`
   :`<p class="small">${a.diff>0?`ร่างกายเธอใช้พลังงานมากกว่าที่สูตรคาดไว้ กินเพิ่มได้อีก <b>${fmt(a.diff)} kcal</b> โดยยังลดน้ำหนักได้ตามแผน`:`น้ำหนักลดช้ากว่าที่ควร ลองลดเป้าลง <b>${fmt(-a.diff)} kcal</b> หรือออกกำลังเพิ่มอีกนิด`}</p>
    <div class="row-between"><span class="muted small">เป้าใหม่ที่แนะนำ</span><span class="big num">${fmt(a.target)}</span></div>
    <div class="btns"><button class="btn" data-act="adaptApply" data-v="${a.target}">ใช้เป้าใหม่</button><button class="btn ghost" data-act="adaptKeep">คงเดิมไว้ก่อน</button></div>`}</section>`;
}
function vBody(){
  const P=S.profile, W=S.weights.slice().sort((a,b)=>a.d<b.d?-1:1), first=W[0], last=W[W.length-1];
  const lost=first&&last?first.kg-last.kg:0, weeks=first&&last?Math.max((pd(last.d)-pd(first.d))/6048e5,1):1, rate=lost/weeks;
  const Wa=S.waist.slice().sort((a,b)=>a.d<b.d?-1:1), wl=Wa[Wa.length-1], act=ACT.find(a=>a[0]===P.activity);
  const bk=S.lastBackup?Math.round((pd(dk())-pd(S.lastBackup))/864e5):null;
  return `<header class="top"><div><div class="eyebrow">ร่างกายและเป้าหมาย</div><h1 class="num">${last?r1(last.kg):'–'} <span class="muted" style="font-size:16px">กก. · เป้า ${r1(P.goal)}</span></h1></div><button class="chip" data-act="weigh">+ บันทึก</button></header>
  <section class="card">${chartSVG(W.map(x=>({d:x.d,v:x.kg})),'กก.')}
   <div class="stats"><div class="stat"><b class="num">${lost>=0?'−':'+'}${r1(Math.abs(lost))}</b><span>กก. ตั้งแต่เริ่ม</span></div>
   <div class="stat"><b class="num">${r1(Math.abs(rate))}</b><span>กก./สัปดาห์</span></div>
   <div class="stat"><b class="num">${last?r1(Math.max(last.kg-P.goal,0)):'–'}</b><span>กก. ถึงเป้า</span></div></div>
   <p class="small muted">${rate>1?'ลดเร็วกว่าที่แนะนำ ลองเพิ่มอาหารอีกนิด เพื่อรักษากล้ามเนื้อไว้':rate>=.2?'กำลังดีเลย อยู่ในช่วงที่ยั่งยืน 0.25–0.75 กก./สัปดาห์':'น้ำหนักแกว่งได้ทุกวัน ดูแนวโน้มหลายสัปดาห์ และดูรอบเอวประกอบด้วย'}</p></section>
  ${adaptCard()}
  ${weekly()}
  <section class="card"><div class="row-between"><h2>รอบเอว</h2><span class="small muted num">${wl?`ล่าสุด ${wl.cm} ซม.`:''}${P.waistGoal?` · เป้า ${P.waistGoal}`:''}</span></div>
   <p class="small muted">บางสัปดาห์น้ำหนักไม่ลด แต่รอบเอวลด แปลว่าหุ่นกำลังกระชับ วัดตรงสะดือ สัปดาห์ละครั้ง</p>
   <div class="inrow"><label class="field" for="waIn">รอบเอว (ซม.)<input id="waIn" type="number" inputmode="decimal" step="0.5" min="40" max="200" placeholder="${wl?wl.cm:'75'}"></label><button class="btn" data-act="saveWaist">บันทึก</button></div><div class="err" id="waErr"></div>
   ${Wa.length>1?`<div class="chips">${Wa.slice(-6).map(x=>`<span class="chip num">${pd(x.d).getDate()}/${pd(x.d).getMonth()+1} · ${x.cm}</span>`).join('')}</div>`:''}</section>
  <section class="card"><div class="row-between"><h2>เป้าหมายทั้งหมด</h2><button class="btn ghost small" data-act="goals">แก้ไข</button></div>
   <div class="stats"><div class="stat"><b class="num">${fmt(P.kcal)}</b><span>kcal/วัน</span></div><div class="stat"><b class="num">${P.protein} g</b><span>โปรตีน/วัน</span></div><div class="stat"><b class="num">${P.water}</b><span>แก้วน้ำ/วัน</span></div>
   <div class="stat"><b class="num">${fmt(P.steps)}</b><span>ก้าว/วัน</span></div><div class="stat"><b class="num">${P.sleep}</b><span>ชม. นอน</span></div><div class="stat"><b class="num">${P.wpw}</b><span>ครั้ง/สัปดาห์</span></div></div>
   <p class="small muted">${P.sex==='f'?'หญิง':'ชาย'} ${P.age} ปี · ${P.height} ซม. · ${act?act[1]:''}</p></section>
  <section class="card"><div class="row-between"><h2>ภาพประกอบของฉัน</h2><span class="pill num">${allSlots().filter(k=>IMGURL[k]).length}/${allSlots().length}</span></div>
   <p class="small muted">ใส่ภาพที่เจนจาก AI แทนภาพวาดในแอป เลือกหลายไฟล์ได้ทีเดียว ระบบจับคู่จากชื่อไฟล์ให้</p>
   <div class="slots mini">${allSlots().filter(k=>IMGURL[k]).slice(0,6).map(k=>`<div class="sp">${slotPreview(k)}</div>`).join('')}</div>
   <button class="btn" data-act="imgSheet">จัดการภาพประกอบ</button></section>
  <section class="card"><div class="row-between"><h2>สำรองข้อมูล</h2><span class="pill ${bk===null||bk>7?'':'p'}">${bk===null?'ยังไม่เคยสำรอง':bk===0?'สำรองวันนี้แล้ว':`สำรองล่าสุด ${bk} วันก่อน`}</span></div>
   <p class="small muted">ข้อมูลเก็บในเครื่องนี้เท่านั้น ถ้าลบแอปหรือเปลี่ยนมือถือจะหาย ส่งไฟล์สำรองเข้า LINE ตัวเองหรือเก็บในแอปไฟล์ไว้ สัปดาห์ละครั้ง</p>
   <div class="btns"><button class="btn" data-act="backupFile">${IC.share} ส่งไฟล์สำรอง</button><button class="btn ghost" data-act="restoreSheet">กู้คืนข้อมูล</button></div>
   <button class="btn ghost small" data-act="backup">หรือคัดลอกเป็นรหัสข้อความ</button>
   <div id="bkOut"></div></section>
  <section class="card flat"><h3>เริ่มใหม่</h3><p class="small muted">${S.example?'ตอนนี้ยังเป็นข้อมูลตัวอย่าง ตั้งค่าของตัวเองแล้วเริ่มใช้จริงได้เลย':'ล้างประวัติทั้งหมดแล้วตั้งค่าใหม่ ควรสำรองข้อมูลก่อน'}</p>
   <button class="btn ghost small" data-act="${S.example?'onboard':'reset'}">${S.example?'เริ่มตั้งค่าของฉัน':'ล้างประวัติทั้งหมด'}</button></section>`;
}
function vPet(){
  const xp=totalXP(), L=levelInfo(xp), [md,mtxt,anim]=mood(), parts=xpParts(dk()), eq=S.pet.equip;
  const stage=L.lv>=10?'แมวโตเต็มวัย':L.lv>=5?'แมววัยรุ่น':'ลูกแมว';
  return `<header class="top"><div><div class="eyebrow">${stage} · เลเวล ${L.lv}</div><h1>${esc(S.pet.name)}</h1></div><button class="chip" data-act="rename">เปลี่ยนชื่อ</button></header>
  <section class="card"><div class="petstage"><button class="petbtn ${anim}" data-act="petTap" aria-label="คุยกับน้องแมว">${catSVG({lv:L.lv,md})}</button><div class="bubble" id="bubble">${mtxt}</div></div>
   <div class="row-between small"><span>EXP</span><span class="num muted">${L.cur}/${L.need} สู่เลเวล ${L.lv+1}</span></div><div class="xpbar"><i style="width:${L.cur/L.need*100}%"></i></div>
   <div class="row-between"><span class="chip num">${IC.flame} ${streak()} วันติด</span><span class="chip num">${IC.coin} ${fmt(coins())} เหรียญ</span></div></section>
  <section class="card"><div class="row-between"><h2>ร้านของน้อง</h2><span class="small muted">1 เหรียญ ทุก 10 EXP</span></div>
   <div class="shop">${SHOP.map(it=>{const own=S.pet.owned.includes(it.id), on=it.slot==='skin'?eq.skin===it.id:eq[it.slot]===it.id;
    const preview={...eq,[it.slot]:it.id};
    return `<div class="item ${on?'eq':''}">${catSVG({lv:L.lv,md:'happy',eq:preview})}<b>${it.name}</b>
     ${own?`<button class="btn small ${on?'ghost':''}" data-act="equip" data-id="${it.id}">${on?'ถอดออก':'ใส่เลย'}</button>`:`<button class="btn small ${coins()<it.price?'ghost':''}" data-act="buy" data-id="${it.id}">${IC.coin} ${it.price}</button>`}</div>`}).join('')}</div></section>
  <section class="card"><h2>สมุดแสตมป์</h2><div class="stamps">${BADGES.map(b=>{const got=b[4]();return `<div class="stamp ${got?'got':''}"><span class="s">${IC[b[3]]||IC.star}</span><b>${b[1]}</b><span>${b[2]}</span></div>`}).join('')}</div></section>
  <section class="card"><h2>วันนี้ได้ EXP จาก</h2>${parts.map(p=>`<div class="xprow ${p[2]?'':'no'}"><span>${p[2]?'✓':'○'} ${p[0]}</span><span class="num">+${p[1]}</span></div>`).join('')}
   <p class="small muted">น้องได้ EXP เมื่อกินพอดีกับเป้า ไม่ใช่ยิ่งกินน้อยยิ่งดี กินน้อยเกินไปจะไม่ได้แต้มแคล</p></section>
  <section class="card"><h2>ปลดล็อกตามเลเวล</h2>${UNLOCKS.map(([l,n])=>`<div class="unlock ${L.lv>=l?'got':''}"><span class="lv num">Lv${l}</span><span>${n}</span></div>`).join('')}</section>
  <section class="card flat small muted">ถ้าหายไปหลายวัน น้องจะแค่เหงา ไม่ป่วย ไม่ลดเลเวล กลับมาเมื่อไหร่ก็ดีใจเสมอ</section>`;
}
function render(animate){
  document.documentElement.dataset.accent=S.profile.accent||'leaf';
  const v={today:vToday,food:vFood,train:vTrain,body:vBody,pet:vPet}[TAB];
  const app=document.getElementById('app');
  app.innerHTML=v();
  app.querySelectorAll('.card').forEach((c,i)=>c.style.setProperty('--i',Math.min(i,8)));
  if(animate){app.classList.add('anim');clearTimeout(render.t);render.t=setTimeout(()=>app.classList.remove('anim'),1100)}
  const db=document.getElementById('datebar'); if(db){const on=db.querySelector('.on');if(on)db.scrollLeft=on.offsetLeft-db.clientWidth+on.offsetWidth+8}
  const mb=document.getElementById('moreBox'); if(mb)mb.addEventListener('toggle',()=>{MORE_OPEN=mb.open});
  document.getElementById('nav').innerHTML=TABS.map(([k,l])=>`<button class="${k===TAB?'on':''}" data-tab="${k}" aria-current="${k===TAB?'page':'false'}">${IC[k]}<span>${l}</span></button>`).join('');
}

/* ================= onboarding ================= */
let OB=null;
function showOB(step){
  const P=S.profile;
  OB=OB||{p:{sex:P.sex,age:P.age,height:P.height,weight:P.weight,goal:P.goal,activity:P.activity},skin:'orange',name:'ข้าวปั้น',t:null};
  OB.step=step; drawOB(); document.getElementById('ob').hidden=false; document.body.style.overflow='hidden';
}
function hideOB(){document.getElementById('ob').hidden=true;document.body.style.overflow='';}
function drawOB(){
  const el=document.getElementById('ob'), s=OB.step, p=OB.p;
  const dots=`<div class="obdots" aria-hidden="true">${[1,2,3].map(i=>`<i class="${s>=i?'on':''}"></i>`).join('')}</div>`;
  let body='';
  if(s===0) body=`<div style="text-align:center;display:flex;flex-direction:column;gap:10px;margin-top:auto">
    <div class="hero-cat">${imgSrc('hero_welcome')?`<img src="${imgSrc('hero_welcome')}" alt="" style="width:100%">`:catSVG({lv:1,md:'happy',eq:{head:null,face:null,skin:'orange'}})}</div>
    <h1>PawFit</h1><p class="muted">ดูแลสุขภาพทีละนิด พร้อมเพื่อนตัวน้อยที่โตไปกับเธอ<br>นับแคล โปรตีน ออกกำลังแบบไม่กดดัน</p></div>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:auto"><button class="btn block" data-act="ob" data-v="1">เริ่มตั้งค่าของฉัน</button><button class="btn ghost block" data-act="obSkip">ขอดูตัวอย่างก่อน</button></div>`;
  else if(s===1) body=`${dots}<div><div class="eyebrow">ขั้นที่ 1 จาก 3</div><h1>เล่าเรื่องร่างกายให้ฟังหน่อย</h1><p class="muted small">ใช้คำนวณเป้าที่พอดีกับเธอ ข้อมูลอยู่ในเครื่องนี้เท่านั้น</p></div>
   <div class="seg-ctl" role="group" aria-label="เพศ"><button type="button" class="${p.sex==='f'?'on':''}" data-act="obSex" data-v="f">หญิง</button><button type="button" class="${p.sex==='m'?'on':''}" data-act="obSex" data-v="m">ชาย</button></div>
   <div class="grid2"><label class="field" for="oAge">อายุ (ปี)<input id="oAge" type="number" inputmode="numeric" value="${p.age}"></label><label class="field" for="oH">ส่วนสูง (ซม.)<input id="oH" type="number" inputmode="numeric" value="${p.height}"></label>
   <label class="field" for="oW">น้ำหนักตอนนี้ (กก.)<input id="oW" type="number" inputmode="decimal" step="0.1" value="${p.weight}"></label><label class="field" for="oG">น้ำหนักเป้าหมาย (กก.)<input id="oG" type="number" inputmode="decimal" step="0.1" value="${p.goal}"></label></div>
   <label class="field" for="oA">ปกติขยับตัวแค่ไหน<select id="oA">${ACT.map(a=>`<option value="${a[0]}" ${a[0]===p.activity?'selected':''}>${a[1]}</option>`).join('')}</select></label>
   <div class="err" id="oErr"></div>
   <div class="obnav"><button class="btn ghost" data-act="ob" data-v="0">ย้อนกลับ</button><button class="btn" data-act="ob1">ถัดไป</button></div>`;
  else if(s===2){
    const t=OB.t||calcTargets(p); OB.t=t; const floor=p.sex==='m'?1500:1200;
    body=`${dots}<div><div class="eyebrow">ขั้นที่ 2 จาก 3</div><h1>นี่คือเป้าของเธอ</h1><p class="muted small">คำนวณให้แล้ว ไม่แน่ใจก็กดถัดไปได้เลย แก้ตัวเลขเองได้ทุกช่อง และแอปจะช่วยปรับให้แม่นขึ้นเมื่อใช้ไป 2–3 สัปดาห์</p></div>
     <div class="card explain">
      <div class="row"><span class="tag A" style="width:36px;height:36px">${IC.spark}</span><span>ร่างกายใช้พลังงานราว</span><b class="num">${fmt(t.tdee)}</b></div>
      <span class="small muted" style="margin-top:-6px">kcal ต่อวัน รวมทั้งตอนพักและตอนขยับตัว ถ้ากินเท่านี้น้ำหนักจะคงที่</span>
      ${p.goal<p.weight?`<div class="small">อยากลดเร็วแค่ไหน</div><div class="chips" id="oPace"></div>`:''}
      <label class="field" for="oK">เป้าแคลต่อวัน (kcal)<input id="oK" type="number" inputmode="numeric" value="${t.kcal}"></label>
      <div id="oGuide" aria-live="polite"></div>
      <label class="field" for="oP">โปรตีนต่อวัน (g) ช่วยรักษากล้ามเนื้อให้หุ่นกระชับ<input id="oP" type="number" inputmode="numeric" value="${t.protein}"></label>
      <div class="grid2"><label class="field" for="oWa">น้ำ (แก้ว 250 มล.)<input id="oWa" type="number" inputmode="numeric" value="${t.water}"></label><label class="field" for="oWpw">ออกกำลัง (ครั้ง/สัปดาห์)<input id="oWpw" type="number" inputmode="numeric" value="3" min="1" max="7"></label></div>
      <details class="howto"><summary>ตัวเลขพวกนี้คิดมาจากไหน?</summary><ol>
       <li><b>พลังงานที่ใช้ต่อวัน</b> = พลังงานพื้นฐานตอนพัก คิดจากเพศ อายุ ส่วนสูง น้ำหนัก (${fmt(Math.round(bmrOf(p)))} kcal) × ระดับการขยับตัว (×${p.activity}) ≈ ${fmt(t.tdee)} kcal</li>
       <li><b>เป้าแคล</b> = กินให้น้อยกว่าที่ใช้นิดหน่อย ไขมัน 1 กก. ≈ 7,700 kcal ถ้าขาดวันละ 400 จะลดได้ราว 0.4 กก./สัปดาห์ และไม่ควรต่ำกว่า ${fmt(floor)} kcal</li>
       <li><b>โปรตีน</b> = น้ำหนัก ${p.weight} กก. × 1.6 g ≈ ${t.protein} g เช่น อกไก่ 100 กรัมได้ราว 23 g ไข่ 1 ฟองราว 6 g</li>
       <li><b>น้ำ</b> = น้ำหนัก × 33 มล. แล้วแบ่งเป็นแก้วละ 250 มล.</li>
       <li><b>ออกกำลัง</b> เพิ่งกลับมาเริ่มใหม่ 2–3 ครั้งต่อสัปดาห์ก็พอ แอปนับเป็นครั้ง หยุดไปก็ทำต่อจากเดิมได้</li></ol></details>
     </div>
     <div class="banner" id="oEta" hidden></div>
     <div class="err" id="oErr"></div>
     <div class="obnav"><button class="btn ghost" data-act="ob" data-v="1">ย้อนกลับ</button><button class="btn" data-act="ob2">ถัดไป</button></div>`;
  }
  else body=`${dots}<div><div class="eyebrow">ขั้นที่ 3 จาก 3</div><h1>เลือกเพื่อนตัวน้อย</h1><p class="muted small">น้องจะโตขึ้นทุกครั้งที่เธอดูแลตัวเอง เลือกสีขนได้หนึ่งแบบ แบบอื่นซื้อเพิ่มทีหลังได้</p></div>
   <div class="skins">${Object.entries(SKINS).map(([k,v])=>`<button class="skin ${OB.skin===k?'on':''}" data-act="obSkin" data-v="${k}" aria-pressed="${OB.skin===k}">${catSVG({lv:1,md:'happy',eq:{head:null,face:null,skin:k}})}<span>${v.name}</span></button>`).join('')}</div>
   <label class="field" for="oName">ตั้งชื่อน้อง<input id="oName" type="text" maxlength="16" value="${esc(OB.name)}"></label>
   <div class="obnav"><button class="btn ghost" data-act="ob" data-v="2">ย้อนกลับ</button><button class="btn" data-act="obDone">เริ่มเลย</button></div>`;
  el.innerHTML=`<div class="ob-in">${body}</div>`;
  if(s===2) obGuide();
}
/* step 2: turn the kcal box into plain words (kg per week, weeks to goal) while the user edits it */
const PACE=[[250,'ค่อยเป็นค่อยไป'],[400,'แนะนำ'],[550,'เร็วขึ้นอีกนิด']];
const paceKcal=(t,p,d)=>Math.max(Math.round((t.tdee-d)/10)*10,p.sex==='m'?1500:1200);
function obGuide(){
  const p=OB.p, t=OB.t, kcal=gv('oK'), g=document.getElementById('oGuide'), eta=document.getElementById('oEta'), pace=document.getElementById('oPace');
  if(!g) return;
  const lose=p.goal<p.weight, floor=p.sex==='m'?1500:1200, rate=Math.max(0,(t.tdee-kcal)*7/7700);
  if(pace) pace.innerHTML=PACE.map(([d,l])=>{const k=paceKcal(t,p,d);return `<button type="button" class="chip ${k===kcal?'on':''}" data-act="obPace" data-v="${k}">${l} <span class="num">${fmt(k)}</span></button>`}).join('');
  let msg='', warn=false;
  if(!(kcal>0)) msg='ใส่ตัวเลขแคลที่อยากกินต่อวัน';
  else if(kcal<floor){msg=`ต่ำกว่า ${fmt(floor)} kcal จะหิวจนเลิกกลางทางได้ง่าย และเสียกล้ามเนื้อ ลองขยับขึ้นอีกนิดนะ`;warn=true}
  else if(!lose) msg=kcal>t.tdee+150?'มากกว่าที่ร่างกายใช้ เหมาะกับคนอยากเพิ่มน้ำหนัก':'ใกล้กับที่ร่างกายใช้ เหมาะกับการรักษาน้ำหนัก';
  else if(rate<=0) msg='เท่ากับหรือมากกว่าที่ร่างกายใช้ น้ำหนักจะยังไม่ลด';
  else if(rate>1){msg=`ลดราว ${r1(rate)} กก./สัปดาห์ เร็วเกินไป เสี่ยงเสียกล้ามเนื้อและเด้งกลับ แนะนำ 0.25–0.75 กก.`;warn=true}
  else if(rate>.75) msg=`ลดราว ${r1(rate)} กก./สัปดาห์ เร็วกว่าที่แนะนำนิดหน่อย ถ้ารู้สึกหิวมากให้เพิ่มแคลขึ้น`;
  else if(rate>=.25) msg=`ลดราว ${r1(rate)} กก./สัปดาห์ กำลังดี ไม่หิวจนทรมาน`;
  else msg=`ลดราว ${r1(rate)} กก./สัปดาห์ ช้าหน่อยแต่ทำได้ยาว ๆ`;
  g.className='small '+(warn?'pace-warn':'muted'); g.textContent=msg;
  const wk=lose&&rate>0&&kcal>=floor?Math.ceil((p.weight-p.goal)/rate):0;
  eta.hidden=!wk;
  if(wk){const end=new Date();end.setDate(end.getDate()+wk*7);eta.innerHTML=`<span>ถ้าทำตามนี้ จะถึง ${p.goal} กก. ในราว <b>${wk} สัปดาห์</b> (ประมาณ${end.toLocaleDateString('th-TH',{month:'long',year:'numeric'})})${rate<=.75?' ช้าแต่ไม่เด้งกลับ':''}</span>`}
}

/* ================= sheets ================= */
const sheet=document.getElementById('sheet'), scrim=document.getElementById('scrim');
function openSheet(title,body){sheet.innerHTML=`<div class="sheet-h"><h2 id="sheetTitle">${title}</h2><button class="x" data-act="close" aria-label="ปิด">×</button></div><div class="sheet-b" id="sb">${body}</div>`;sheet.classList.add('open');scrim.classList.add('open')}
function closeSheet(){sheet.classList.remove('open');scrim.classList.remove('open');ADD=null}
let ADD=null;
function openAdd(meal){
  ADD={meal,cat:'all',q:''};
  openSheet(isToday()?'เพิ่มอาหาร':`เพิ่มอาหาร · ${thDate(CUR,{day:'numeric',month:'short'})}`,`<div class="chips" id="mealChips"></div><input class="search" id="q" type="search" placeholder="ค้นหาเมนู เช่น กะเพรา อกไก่" autocomplete="off" aria-label="ค้นหาเมนู"><div class="chips" id="catChips"></div><div class="res" id="res"></div><button class="btn ghost" data-act="customForm">+ เพิ่มเมนูเอง</button>`);
  drawAdd();
}
function drawAdd(){
  if(!ADD||!document.getElementById('res')) return;
  document.getElementById('mealChips').innerHTML=MEALS.map(([m,l])=>`<button class="chip ${ADD.meal===m?'on':''}" data-act="pickMeal" data-m="${m}">${l}</button>`).join('');
  document.getElementById('catChips').innerHTML=CATS.map(([c,l])=>`<button class="chip ${ADD.cat===c?'on':''}" data-act="pickCat" data-c="${c}">${l}</button>`).join('');
  const q=ADD.q.trim(), c=ADD.cat;
  const list=allFoods().filter(f=>(!q||f.name.includes(q))&&(c==='all'||(c==='protein'?f.p/f.kcal>=.08:c==='fav'?S.favs.includes(f.id):f.cat===c)));
  document.getElementById('res').innerHTML=list.length?list.map(f=>{const fv=S.favs.includes(f.id);return `<div class="rrow">${foodImg(f.art,46)}<span class="n"><b>${esc(f.name)}</b><span class="pill num">${f.kcal} kcal</span> <span class="pill p num">P ${r1(f.p)}</span> <span class="pill num">C ${r1(f.c)} · F ${r1(f.f)}</span></span>
   <button class="star ${fv?'on':''}" data-act="fav" data-id="${f.id}" aria-pressed="${fv}" aria-label="${fv?'เอาออกจาก':'ตั้งเป็น'}เมนูประจำ">${fv?IC.starF:IC.starO}</button><button class="plus" data-act="pick" data-id="${f.id}" aria-label="เพิ่ม ${esc(f.name)}">+</button></div>`}).join(''):`<div class="empty">ไม่พบ "${esc(q)}" ลองเพิ่มเป็นเมนูของตัวเองได้</div>`;
}
function customForm(){
  document.getElementById('sb').innerHTML=`<p class="small muted">ดูตัวเลขได้จากฉลากด้านหลังสินค้า หรือประมาณจากเมนูที่ใกล้เคียง</p>
  <label class="field" for="cName">ชื่อเมนู<input id="cName" type="text" maxlength="40" placeholder="เช่น ข้าวผัดกะเพราร้านป้า"></label>
  <div class="grid2"><label class="field" for="cK">แคลอรี (kcal)<input id="cK" type="number" inputmode="numeric" min="0"></label><label class="field" for="cP">โปรตีน (g)<input id="cP" type="number" inputmode="decimal" min="0"></label>
  <label class="field" for="cC">คาร์บ (g)<input id="cC" type="number" inputmode="decimal" min="0" placeholder="ไม่ใส่ก็ได้"></label><label class="field" for="cF">ไขมัน (g)<input id="cF" type="number" inputmode="decimal" min="0" placeholder="ไม่ใส่ก็ได้"></label></div>
  <label class="quest" style="cursor:pointer"><input type="checkbox" id="cFav" checked style="width:20px;height:20px;accent-color:var(--leaf)"> <span>ตั้งเป็นเมนูประจำด้วย</span></label>
  <div class="err" id="cErr"></div><button class="btn" data-act="saveCustom">บันทึกและเพิ่มในมื้อนี้</button>`;
}
function goalsSheet(){
  const P=S.profile;
  openSheet('โปรไฟล์และเป้าหมาย',`<div id="pf" style="display:flex;flex-direction:column;gap:12px">
  <h3>ข้อมูลร่างกาย</h3>
  <div class="seg-ctl" role="group" aria-label="เพศ"><button type="button" class="${P.sex==='f'?'on':''}" data-act="sex" data-v="f">หญิง</button><button type="button" class="${P.sex==='m'?'on':''}" data-act="sex" data-v="m">ชาย</button></div>
  <input type="hidden" id="pSex" value="${P.sex}">
  <div class="grid2"><label class="field" for="pAge">อายุ (ปี)<input id="pAge" type="number" inputmode="numeric" value="${P.age}"></label><label class="field" for="pH">ส่วนสูง (ซม.)<input id="pH" type="number" inputmode="numeric" value="${P.height}"></label>
  <label class="field" for="pW">น้ำหนักตอนนี้ (กก.)<input id="pW" type="number" inputmode="decimal" step="0.1" value="${P.weight}"></label><label class="field" for="pG">น้ำหนักเป้าหมาย (กก.)<input id="pG" type="number" inputmode="decimal" step="0.1" value="${P.goal}"></label></div>
  <label class="field" for="pA">ระดับกิจกรรม<select id="pA">${ACT.map(a=>`<option value="${a[0]}" ${a[0]===P.activity?'selected':''}>${a[1]}</option>`).join('')}</select></label>
  <h3>เป้ารายวัน</h3><span class="small muted">แคลกับโปรตีนคำนวณให้อัตโนมัติจากข้อมูลด้านบน ปรับเองได้ทุกช่อง</span>
  <div class="grid2"><label class="field" for="pK">แคลอรี (kcal)<input id="pK" type="number" inputmode="numeric" value="${P.kcal}"></label><label class="field" for="pP">โปรตีน (g)<input id="pP" type="number" inputmode="numeric" value="${P.protein}"></label>
  <label class="field" for="pWa">น้ำ (แก้ว 250 มล.)<input id="pWa" type="number" inputmode="numeric" value="${P.water}"></label><label class="field" for="pSt">ก้าวเดิน<input id="pSt" type="number" inputmode="numeric" step="500" value="${P.steps}"></label>
  <label class="field" for="pSl">นอน (ชม.)<input id="pSl" type="number" inputmode="decimal" step="0.5" value="${P.sleep}"></label><label class="field" for="pWpw">ออกกำลัง (ครั้ง/สัปดาห์)<input id="pWpw" type="number" inputmode="numeric" min="1" max="7" value="${P.wpw}"></label>
  <label class="field" for="pWg">เป้ารอบเอว (ซม.)<input id="pWg" type="number" inputmode="decimal" placeholder="ไม่ตั้งก็ได้" value="${P.waistGoal||''}"></label></div>
  <h3>สีของแอป</h3><div class="accents">${[['leaf','#2D7A52','เขียวใบไม้'],['sakura','#C8476F','ชมพูซากุระ'],['sky','#2F6FCB','ฟ้าท้องฟ้า']].map(([k,c,n])=>`<button class="acc ${(P.accent||'leaf')===k?'on':''}" style="background:${c}" data-act="accent" data-v="${k}" aria-label="${n}" aria-pressed="${(P.accent||'leaf')===k}"></button>`).join('')}</div>
  <div class="err" id="pErr"></div><button class="btn" type="button" data-act="saveGoals">บันทึก</button></div>`);
}
const gv=id=>parseFloat(document.getElementById(id).value);
function readProfile(){return {sex:document.getElementById('pSex').value,age:gv('pAge'),height:gv('pH'),weight:gv('pW'),goal:gv('pG'),activity:gv('pA')}}
function recalcProfile(){
  const p=readProfile(); if([p.age,p.height,p.weight].some(n=>!(n>0)))return;
  const t=calcTargets(p);
  [['pK',t.kcal],['pP',t.protein],['pWa',t.water]].forEach(([id,v])=>{const el=document.getElementById(id);if(!el.dataset.touched)el.value=v});
}
function numberSheet(kind){
  const d=day();
  if(kind==='steps') openSheet('ก้าวเดิน',`<p class="small muted">ดูตัวเลขจากแอปสุขภาพในมือถือหรือนาฬิกา แล้วกรอกตรงนี้ ในแอปจริงจะดึงให้อัตโนมัติ</p>
   <label class="field" for="stIn">จำนวนก้าว<input id="stIn" type="number" inputmode="numeric" value="${d.steps||''}" placeholder="0"></label>
   <div class="btns"><button class="btn ghost small" data-act="stepAdd" data-v="1000">+1,000</button><button class="btn ghost small" data-act="stepAdd" data-v="2000">+2,000</button><button class="btn ghost small" data-act="stepAdd" data-v="5000">+5,000</button></div>
   <button class="btn" data-act="saveSteps">บันทึก</button>`);
  else openSheet('เมื่อคืนนอนกี่ชั่วโมง',`<div class="bigstep"><button data-act="sleepD" data-v="-0.5" aria-label="ลดครึ่งชั่วโมง">−</button><b class="num" id="slV">${d.sleep||7}</b><button data-act="sleepD" data-v="0.5" aria-label="เพิ่มครึ่งชั่วโมง">+</button></div>
   <p class="small muted" style="text-align:center">เป้า ${S.profile.sleep} ชั่วโมง นอนพอช่วยลดความอยากของหวานได้จริง</p><button class="btn" data-act="saveSleep">บันทึก</button>`);
}
function weighSheet(){
  const W=S.weights.slice().sort((a,b)=>a.d<b.d?-1:1), last=W[W.length-1];
  openSheet(isToday()?'ชั่งน้ำหนักวันนี้':`น้ำหนัก ${thDate(CUR,{day:'numeric',month:'short'})}`,`<label class="field" for="wIn">น้ำหนัก (กก.)<input id="wIn" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="${last?r1(last.kg):'60.0'}"></label><div class="err" id="wErr"></div>
   <p class="small muted">ชั่งตอนเช้าหลังเข้าห้องน้ำ ก่อนกินอะไร จะได้ค่าที่เทียบกันได้</p><button class="btn" data-act="saveW">บันทึก</button>`);
  setTimeout(()=>{const i=document.getElementById('wIn');i&&i.focus()},350);
}
function sessionSheet(){
  const s=sessionInfo(S.program.done), wi=s.week-1;
  if(s.type==='C'){
    const segs=cardioSegs(s.week);
    openSheet(`${s.title} · สัปดาห์ ${s.week}`,`<div class="exhead">${figSVG('walk')}<div><p class="small muted">ทำข้างนอกหรือบนลู่วิ่งก็ได้ ปั่นจักรยาน เครื่องเดินวงรี หรือเต้นแอโรบิกแทนได้ กดเริ่มแล้วแอปจะบอกจังหวะให้</p></div></div>
     <div class="card">${segs.reduce((acc,g)=>{const l=acc[acc.length-1];if(l&&l.l===g.l)l.n++;else acc.push({...g,n:1});return acc},[]).map(g=>`<div class="seg"><span>${g.l}${g.n>1?` ×${g.n}`:''}</span><span class="num muted">${g.s>=60?r1(g.s/60)+' นาที':g.s+' วินาที'}</span></div>`).join('')}</div>
     <div class="btns"><button class="btn" data-act="runCardio">เริ่มจับเวลา</button><button class="btn ghost" data-act="finish">ทำเสร็จแล้ว บันทึก</button></div>`);
    return;
  }
  const ex=s.type==='A'?EX_A:EX_B, [sets,reps]=REPS[wi];
  openSheet(`${s.title} · สัปดาห์ ${s.week}`,`<div class="card flat" style="gap:4px"><b>วอร์มอัพ 5 นาที</b><span class="small">หมุนไหล่ หมุนสะโพก ย่ำเท้า สควอทตัวเปล่า 10 ครั้ง</span></div>
  <p class="small muted">${sets} เซต × ${reps} ครั้ง พัก 60 วินาที กดเซตที่ทำเสร็จแล้วตัวจับเวลาพักจะเริ่มเอง ทำครบทุกเซตแบบสบาย ๆ ครั้งหน้าเพิ่ม 0.5–1 กก.</p>
  ${ex.map(e=>`<div class="ex"><div class="exhead">${figSVG(e.fig)}<div><div class="row-between"><b>${e.n}</b><span class="pill num">${e.time?`${PLANK[wi]} วินาที`:`${reps} ครั้ง`}</span></div><span class="small muted">${e.alt}</span><span class="small">${e.cue}</span></div></div>
   <div class="sets">${Array.from({length:sets},(_,j)=>`<button class="set" data-act="set" aria-pressed="false">เซต ${j+1}</button>`).join('')}
   ${e.bw?'':`<input class="kg num" type="number" inputmode="decimal" step="0.5" min="0" data-lift="${esc(e.n)}" value="${S.lifts[e.n]??''}" placeholder="กก." aria-label="น้ำหนักที่ใช้ ${esc(e.n)}">`}</div></div>`).join('')}
  <div class="btns"><button class="btn ghost" data-act="rest">พัก 60 วินาที</button><button class="btn" data-act="finish">จบการฝึก บันทึก</button></div>`);
}
function timedSheet(kind){
  const mini=kind==='mini';
  openSheet(mini?'10 นาทีก็นับแล้ว':'ยืดเหยียด 5 นาที',`<p class="small muted">${mini?'วันที่ไม่มีแรง ทำแค่นี้ก็พอ สำคัญคือไม่ขาดนิสัย 5 ท่า วนสองรอบ ทำ 40 วินาที พัก 20 วินาที ไม่ต้องใช้อุปกรณ์':'เหมาะกับคนนั่งทำงานนาน ทำหลังเลิกงานหรือก่อนนอน ค้างท่าละ 40 วินาที หายใจช้า ๆ ไม่ต้องฝืนจนเจ็บ'}</p>
  ${mini?MINI.map(([n,f])=>`<div class="ex"><div class="exhead">${figSVG(f)}<div><b>${n}</b><span class="small muted">${f==='plank'?'30 วินาที':'40 วินาที'} แล้วพัก</span></div></div></div>`).join('')
   :`<div class="card">${STRETCH.map(n=>`<div class="seg"><span>${n}</span><span class="muted num">40 วิ</span></div>`).join('')}</div>`}
  <div class="btns"><button class="btn" data-act="${mini?'runMini':'runStretch'}">เริ่มจับเวลา</button><button class="btn ghost" data-act="${mini?'finishMini':'finishStretch'}">ทำเสร็จแล้ว บันทึก</button></div>`);
}
function restoreSheet(){
  openSheet('กู้คืนข้อมูล',`<p class="small muted">เลือกไฟล์สำรอง (.json) หรือวางรหัสสำรองที่คัดลอกเก็บไว้ ข้อมูลในเครื่องตอนนี้จะถูกแทนที่ทั้งหมด</p>
   <label class="btn ghost block" for="rFile">เลือกไฟล์สำรอง</label><input id="rFile" type="file" accept=".json,application/json,text/plain" hidden>
   <textarea class="code" id="rIn" aria-label="รหัสสำรอง" placeholder="วางรหัสตรงนี้"></textarea><div class="err" id="rErr"></div>
   <button class="btn" data-act="restore" id="rBtn">กู้คืนข้อมูล</button>`);
}
/* ---------- illustration manager ---------- */
function slotGroups(){
  const ak=Object.keys(ART).filter(k=>k!=='empty_plate');
  return [['อาหารจานหลัก',ak.filter(k=>k.startsWith('food_'))],
   ['ร้านสะดวกซื้อ',ak.filter(k=>k.startsWith('cvs_')).concat('snack_egg_white')],
   ['เครื่องดื่มและของว่าง',ak.filter(k=>(k.startsWith('drink_')||k.startsWith('snack_'))&&k!=='snack_egg_white')],
   ['ท่าออกกำลัง',[...new Set(Object.values(FIGFILE))]],
   ['ภาพประกอบพิเศษ',['hero_welcome','boss_lazy','celebrate','empty_plate']]];
}
const allSlots=()=>slotGroups().flatMap(g=>g[1]);
function slotLabel(k){
  const f=FOODS.find(x=>x.art===k); if(f) return f.name.replace(/ \(.*\)/,'');
  const fig=Object.keys(FIGFILE).find(x=>FIGFILE[x]===k), ex=EX_A.concat(EX_B).find(e=>e.fig===fig);
  if(ex) return ex.n;
  return {ex_wall_pushup:'วิดพื้นกับกำแพง',ex_march:'ย่ำเท้า ยกเข่า',ex_walk:'เดินเร็ว',ex_stretch:'ยืดเหยียด',hero_welcome:'หน้าต้อนรับ',boss_lazy:'เจ้าขี้เกียจ',celebrate:'ฉลองเลเวลอัป',empty_plate:'จานว่าง'}[k]||k;
}
function slotPreview(k){
  const src=imgSrc(k); if(src) return `<img src="${src}" alt="">`;
  if(k.startsWith('ex_')){const fig=Object.keys(FIGFILE).find(x=>FIGFILE[x]===k);return figSVG(fig)}
  if(k==='hero_welcome') return catSVG({lv:1,md:'happy',eq:{head:null,face:null,skin:'orange'}});
  if(k==='boss_lazy') return bossSVG;
  if(k==='celebrate') return `<span class="fart" style="--s:56px;color:var(--sun)">${IC.star}</span>`;
  return foodImg(k,64);
}
function imgSheet(msg=''){
  const groups=slotGroups(), total=allSlots().length, done=allSlots().filter(k=>IMGURL[k]).length;
  openSheet('ภาพประกอบของฉัน',`<p class="small muted">เลือกรูปทีละหลายไฟล์ได้ ระบบจะจับคู่จากชื่อไฟล์ให้เอง เช่น <b>food_kaprao.png</b> หรือกดที่ช่องไหนก็ได้เพื่อใส่รูปทีละช่อง ภาพที่ยังไม่มีจะใช้ภาพวาดเดิม</p>
   <div class="row-between"><span class="small">ใส่แล้ว <b class="num">${done}/${total}</b> ภาพ</span><span class="small muted num">${Math.round(done/total*100)}%</span></div>${bar(done,total,'var(--leaf)')}
   <label class="btn block" for="imgMulti">${IC.spark} เลือกรูปหลายไฟล์</label><input id="imgMulti" type="file" accept="image/*" multiple hidden>
   <label class="quest" style="cursor:pointer"><input type="checkbox" id="imgBg" ${IMGBG?'checked':''} style="width:20px;height:20px;accent-color:var(--leaf)"> <span>ลบพื้นหลังสีขาวให้อัตโนมัติ</span></label>
   <div id="imgMsg" class="small" role="status">${msg}</div>
   ${groups.map(([name,keys])=>{const d=keys.filter(k=>IMGURL[k]).length;return `<div class="row-between"><h3>${name}</h3><span class="pill num">${d}/${keys.length}</span></div>
    <div class="slots">${keys.map(k=>`<div class="slot ${IMGURL[k]?'has':''}"><div class="sp">${slotPreview(k)}</div><b>${slotLabel(k)}</b><span class="fn">${k}.png</span>
     <div class="sb"><label class="chip" for="f_${k}">${IMGURL[k]?'เปลี่ยน':'ใส่รูป'}</label><input type="file" id="f_${k}" data-slot="${k}" accept="image/*" hidden>${IMGURL[k]?`<button class="chip" data-act="imgDel" data-k="${k}" aria-label="ลบรูป ${slotLabel(k)}">ลบ</button>`:''}</div></div>`).join('')}</div>`}).join('')}
   <p class="small muted">รูปเก็บอยู่ในเครื่องนี้เท่านั้น และไม่รวมอยู่ในรหัสสำรอง ตอนทำแอปจริง รูปชุดเดียวกันนี้จะถูกใส่ไว้ในตัวแอป ทุกเครื่องจะเห็นเหมือนกัน</p>`);
}
let IMGBG=true;
const normName=n=>n.toLowerCase().replace(/\.[a-z0-9]+$/,'').replace(/\s*\(\d+\)$/,'').trim().replace(/[\s-]+/g,'_');
async function processImg(file,removeBg){
  const url=URL.createObjectURL(file), im=new Image();
  await new Promise((r,j)=>{im.onload=r;im.onerror=j;im.src=url});
  const sc=Math.min(1,360/Math.max(im.width,im.height)), w=Math.max(1,Math.round(im.width*sc)), h=Math.max(1,Math.round(im.height*sc));
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');cx.drawImage(im,0,0,w,h);URL.revokeObjectURL(url);
  if(removeBg){
    const d=cx.getImageData(0,0,w,h),px=d.data, near=i=>px[i+3]>200&&px[i]>232&&px[i+1]>232&&px[i+2]>232;
    const corners=[0,w-1,(h-1)*w,(h-1)*w+w-1];
    if(corners.filter(p=>near(p*4)).length>=3){
      const seen=new Uint8Array(w*h), st=corners.filter(p=>near(p*4));
      while(st.length){const p=st.pop();if(seen[p])continue;seen[p]=1;const i=p*4;if(!near(i))continue;px[i+3]=0;const x=p%w,y=(p/w)|0;if(x>0)st.push(p-1);if(x<w-1)st.push(p+1);if(y>0)st.push(p-w);if(y<h-1)st.push(p+w)}
      cx.putImageData(d,0,0);
    }
  }
  return new Promise(r=>cv.toBlob(b=>r(b),'image/webp',.9));
}
async function addImages(pairs){
  const msg=document.getElementById('imgMsg'); let ok=0; const bad=[];
  for(const [k,file] of pairs){
    if(msg) msg.textContent=`กำลังใส่รูป ${ok+1}/${pairs.length}…`;
    try{const b=await processImg(file,IMGBG); await IDB.put(k,b); setImgURL(k,b); ok++}catch(e){bad.push(file.name)}
  }
  return {ok,bad};
}
function installSheet(){
  openSheet('ติดตั้งลงหน้าจอโฮม',`<div class="card flat" style="gap:10px">
   <div class="quest"><span class="check" style="border:0;background:var(--leaf);color:var(--leaf-ink)">1</span><span>เปิดลิงก์นี้ใน <b>Safari</b></span></div>
   <div class="quest"><span class="check" style="border:0;background:var(--leaf);color:var(--leaf-ink)">2</span><span>แตะปุ่มแชร์ ${IC.share} ที่แถบด้านล่าง</span></div>
   <div class="quest"><span class="check" style="border:0;background:var(--leaf);color:var(--leaf-ink)">3</span><span>เลื่อนลงแล้วแตะ <b>เพิ่มไปยังหน้าจอโฮม</b></span></div>
   <div class="quest"><span class="check" style="border:0;background:var(--leaf);color:var(--leaf-ink)">4</span><span>แตะ <b>เพิ่ม</b> แล้วเปิด PawFit จากไอคอนน้องแมว</span></div></div>
   <p class="small muted">ข้อควรรู้: ข้อมูลในแอปบนหน้าจอโฮมแยกจากใน Safari ถ้าเคยลองใช้ใน Safari มาก่อน ให้ส่งไฟล์สำรองจาก Safari แล้วกู้คืนในแอปที่ติดตั้ง</p>
   <div class="btns"><button class="btn" data-act="close">เข้าใจแล้ว</button><button class="btn ghost" data-act="installHide">ไม่ต้องแสดงอีก</button></div>`);
}
const HEALTH_SHORTCUT='PawFit Health';
function healthSheet(msg=''){
  openSheet('ดึงข้อมูลจาก Apple Health',`<p class="small muted">แอปคำสั่งลัดจะอ่านก้าว การนอน และน้ำหนักวันนี้ แล้วคัดลอกไว้ให้ กลับมาที่นี่แล้วกด <b>วางข้อมูล</b></p>
   <button class="btn block" data-act="healthRun">1. เปิดคำสั่งลัด "${HEALTH_SHORTCUT}"</button>
   <button class="btn block" data-act="healthPaste">2. วางข้อมูล</button>
   <details class="card flat"><summary class="small">วางเองแบบกดค้าง</summary><textarea class="code" id="hIn" aria-label="ข้อมูลจากคำสั่งลัด" placeholder='{"pawfit":1,"steps":8000}'></textarea><button class="btn ghost small" data-act="healthPasteText">นำเข้าข้อความนี้</button></details>
   <div class="err" id="hErr" role="status">${msg}</div>
   <button class="btn ghost small" data-act="healthSetup">ยังไม่มีคำสั่งลัด? ดูวิธีสร้าง</button>`);
}
function healthSetupSheet(){
  const step=(n,t,en)=>`<div class="quest" style="align-items:flex-start"><span class="check" style="border:0;background:var(--leaf);color:var(--leaf-ink);flex:none">${n}</span><span>${t}${en?`<br><span class="small muted">${en}</span>`:''}</span></div>`;
  openSheet('สร้างคำสั่งลัด PawFit Health',`<p class="small muted">ทำครั้งเดียว ใช้ได้ตลอด เปิดแอป <b>คำสั่งลัด</b> แล้วแตะ + เพื่อสร้างใหม่ ตั้งชื่อว่า <b>${HEALTH_SHORTCUT}</b> (ต้องตรงทุกตัวอักษร)</p>
   <div class="card flat" style="gap:12px">
   ${step(1,'เพิ่ม <b>ค้นหาตัวอย่างสุขภาพ</b> เลือกชนิด <b>ขั้น</b> และวันที่เริ่ม <b>วันนี้</b>','Find Health Samples · Type: Steps · Start Date is Today')}
   ${step(2,'เพิ่ม <b>คำนวณสถิติ</b> เลือก <b>ผลรวม</b>','Calculate Statistics · Sum')}
   ${step(3,'เพิ่ม <b>ข้อความ</b> แล้วพิมพ์ <code>{"pawfit":1,"steps":</code> ตามด้วยตัวแปรผลลัพธ์จากข้อ 2 แล้วปิดด้วย <code>}</code>','Text: {"pawfit":1,"steps":[Statistics]}')}
   ${step(4,'เพิ่ม <b>คัดลอกไปที่คลิปบอร์ด</b>','Copy to Clipboard')}
   ${step(5,'เพิ่ม <b>แสดงการแจ้งเตือน</b> ข้อความ "กลับไปที่ PawFit แล้วกดวาง"','Show Notification')}
   </div>
   <p class="small muted">ครั้งแรกที่รัน iPhone จะขออนุญาตอ่านข้อมูลสุขภาพ แตะอนุญาตได้เลย ถ้าอยากได้การนอนและน้ำหนักด้วย ทำซ้ำข้อ 1–2 กับชนิด "การวิเคราะห์การนอน" และ "น้ำหนัก" แล้วเพิ่มในข้อความเป็น <code>"sleep":</code> และ <code>"weight":</code></p>
   <button class="btn" data-act="health">กลับไปดึงข้อมูล</button>`);
}
function importHealth(text){
  let o; try{o=JSON.parse(String(text).trim().replace(/[“”]/g,'"'))}catch(e){return 'ข้อมูลไม่ใช่รูปแบบของ PawFit ลองรันคำสั่งลัดใหม่แล้วกดวางอีกครั้ง'}
  if(!o||o.pawfit!==1) return 'ข้อมูลไม่ใช่รูปแบบของ PawFit ลองรันคำสั่งลัดใหม่แล้วกดวางอีกครั้ง';
  const k=/^\d{4}-\d{2}-\d{2}$/.test(o.date||'')?o.date:dk(), num=v=>typeof v==='string'?parseFloat(v.replace(/,/g,'')):v;
  const steps=num(o.steps), sleep=num(o.sleep), weight=num(o.weight), got=[];
  act(()=>{const d=day(k);
    if(steps>=0&&steps<=100000){d.steps=Math.round(steps);got.push(`${fmt(steps)} ก้าว`)}
    if(sleep>0&&sleep<=14){d.sleep=r1(sleep);got.push(`นอน ${r1(sleep)} ชม.`)}
    if(weight>=30&&weight<=250){S.weights=S.weights.filter(w=>w.d!==k);S.weights.push({d:k,kg:r1(weight)});S.profile.weight=S.weights.slice().sort((a,b)=>a.d<b.d?-1:1).pop().kg;d.weighed=true;got.push(`${r1(weight)} กก.`)}
  },'ดึงจาก Apple Health แล้ว');
  if(!got.length) return 'ไม่พบตัวเลขที่ใช้ได้ในข้อมูล';
  closeSheet(); toast('ดึงจาก Apple Health แล้ว: '+got.join(' · '),0,true); return '';
}
function backupFileName(){return `pawfit-backup-${dk()}.json`}
const encodeBackup=()=>btoa(unescape(encodeURIComponent(JSON.stringify(S))));
function decodeBackup(code){code=code.trim();if(code.startsWith('{'))return JSON.parse(code);return JSON.parse(decodeURIComponent(escape(atob(code.replace(/\s/g,'')))))}

/* ================= runner ================= */
let RUN=null, AC=null, WL=null;
function audio(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume&&AC.resume()}catch(e){}}
function beep(f,d){if(!AC)return;try{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.setValueAtTime(.09,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
async function wake(){try{WL=await navigator.wakeLock.request('screen')}catch(e){}}
function startRun(segs,done){stopRun();audio();wake();RUN={segs,i:0,left:segs[0].s,paused:false,done,total:segs.reduce((a,b)=>a+b.s,0),el:0,fig:null};RUN.t=setInterval(tick,1000);drawRun()}
function stopRun(){if(RUN)clearInterval(RUN.t);RUN=null;try{WL&&WL.release()}catch(e){}WL=null;drawRun()}
function tick(){
  if(!RUN||RUN.paused)return; RUN.left--; RUN.el++;
  if(RUN.left>0&&RUN.left<=3)beep(660,.1);
  if(RUN.left<=0){beep(880,.35);RUN.i++;if(RUN.i>=RUN.segs.length){const cb=RUN.done;stopRun();cb&&cb();return}RUN.left=RUN.segs[RUN.i].s}
  drawRun();
}
function drawRun(){
  const el=document.getElementById('runner');
  if(!RUN){el.hidden=true;el.innerHTML='';return}
  const s=RUN.segs[RUN.i], nx=RUN.segs[RUN.i+1], f=s.fig||null;
  el.hidden=false;
  if(!el.firstChild||RUN.fig!==f){
    RUN.fig=f;
    el.innerHTML=`<div class="runner-in ${f?'withfig':''}">${f?figSVG(f):''}<div><div class="l"></div><div class="t num"></div><div class="nx"></div></div>
    <div class="rb"><button data-act="rPause"></button><button data-act="rSkip" aria-label="ข้ามช่วงนี้">⏭</button><button data-act="rStop" aria-label="หยุดจับเวลา">✕</button></div>
    <div class="pg"><i></i></div></div>`;
  }
  el.querySelector('.l').textContent=s.l;
  el.querySelector('.t').textContent=`${Math.floor(RUN.left/60)}:${pad(RUN.left%60)}`;
  el.querySelector('.nx').textContent=nx?`ถัดไป: ${nx.l}`:'';
  const pb=el.querySelector('[data-act="rPause"]');pb.textContent=RUN.paused?'▶':'❚❚';pb.setAttribute('aria-label',RUN.paused?'เล่นต่อ':'หยุดชั่วคราว');
  el.querySelector('.pg i').style.width=(RUN.el/RUN.total*100)+'%';
}

/* ================= figure animation ================= */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function animFigs(now){
  document.querySelectorAll('svg.fig').forEach(svg=>{
    const P=POSE[svg.dataset.fig]; if(!P) return;
    const ph=(Math.sin(now/P[2]*Math.PI*2-Math.PI/2)+1)/2, e=ph*ph*(3-2*ph);
    const pts=P[0].map((v,i)=>v+(P[1][i]-v)*e), L=svg.querySelectorAll('line.b');
    SEGS.forEach(([a,b],j)=>{const l=L[j];if(!l)return;l.setAttribute('x1',pts[a*2]);l.setAttribute('y1',pts[a*2+1]);l.setAttribute('x2',pts[b*2]);l.setAttribute('y2',pts[b*2+1])});
    const c=svg.querySelector('circle');c.setAttribute('cx',pts[0]);c.setAttribute('cy',pts[1]);
  });
  requestAnimationFrame(animFigs);
}
if(!RM) requestAnimationFrame(animFigs);

/* ================= feedback ================= */
let toastT, UNDO=null;
function toast(m,xp,undo,celebrate){
  const t=document.getElementById('toast');
  t.innerHTML=`${celebrate&&imgSrc('celebrate')?`<img src="${imgSrc('celebrate')}" alt="" style="width:30px;height:30px;object-fit:contain">`:''}<span>${esc(m)}</span>${xp?`<span class="xp num">+${xp} EXP</span>`:''}${undo?'<button class="undo" data-act="undo">เลิกทำ</button>':''}`;
  t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>{t.classList.remove('show');UNDO=null},undo?4500:2300);
}
function burst(x,y,n=22){
  if(RM)return;
  const cols=['var(--leaf)','var(--sun)','var(--kcal)','var(--prot)','var(--water)','#F06B9B'];
  for(let i=0;i<n;i++){const e=document.createElement('i');e.className='fx';const a=Math.random()*Math.PI*2,r=60+Math.random()*90;
    e.style.cssText=`left:${x}px;top:${y}px;background:${cols[i%cols.length]};--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r+40}px;--r:${Math.random()*540}deg;border-radius:${i%3?'2px':'50%'}`;
    document.body.appendChild(e);setTimeout(()=>e.remove(),1000);}
}
function heart(x,y){if(RM)return;const e=document.createElement('i');e.className='fx heart';e.textContent='♥';e.style.left=(x-8)+'px';e.style.top=(y-20)+'px';document.body.appendChild(e);setTimeout(()=>e.remove(),1000)}
let lastXY=[innerWidth/2,innerHeight/3];
function act(fn,msg,opt={}){
  const snap=JSON.stringify(S);
  const b=totalXP(), lb=levelOf(b), qb=qDoneOn(CUR), bb=bossWins(), stb=BADGES.filter(x=>x[4]()).length;
  fn(); save(); render(); if(ADD)drawAdd();
  UNDO=opt.noUndo?null:snap; const u=!opt.noUndo;
  const a=totalXP(), d=a-b;
  if(opt.quiet){toast(msg,0,u)}
  else if(levelOf(a)>lb){toast(`เลเวลอัป! ${S.pet.name} เลเวล ${levelOf(a)} แล้ว`,d,u,1);burst(innerWidth/2,innerHeight/3,40)}
  else if(bossWins()>bb){toast('ปราบเจ้าขี้เกียจได้แล้ว!',d,u);burst(innerWidth/2,innerHeight/3,36)}
  else if(qDoneOn(CUR)===3&&qb<3){toast('ภารกิจครบ 3 ข้อ! รับโบนัส',d,u,1);burst(innerWidth/2,innerHeight/3,44)}
  else if(BADGES.filter(x=>x[4]()).length>stb){toast('ได้แสตมป์ใหม่!',d,u);burst(...lastXY,30)}
  else if(qDoneOn(CUR)>qb){toast('ภารกิจสำเร็จ!',d,u);burst(...lastXY)}
  else toast(msg||'บันทึกแล้ว',d>0&&!opt.quiet?d:0,u);
}
function addFood(f,meal){if(f)act(()=>day().foods.push(logOf(f,meal)),`เพิ่ม ${f.name}`)}
function finishWorkout(kind,name,min,advance){
  act(()=>{day().workouts.push({kind,name,min});if(advance)S.program.done++},`เก่งมาก บันทึก${name}แล้ว`);
  stopRun(); closeSheet();
}

/* ================= events ================= */
document.addEventListener('pointerdown',e=>{lastXY=[e.clientX,e.clientY]},{passive:true});
document.addEventListener('click',e=>{
  const tb=e.target.closest('[data-tab]'); if(tb){if(TAB!==tb.dataset.tab){TAB=tb.dataset.tab;render(true);window.scrollTo(0,0)}return}
  const b=e.target.closest('[data-act]'); if(!b)return;
  const a=b.dataset.act;
  switch(a){
   case 'close': closeSheet(); break;
   case 'day': CUR=b.dataset.k; render(); break;
   case 'undo': if(UNDO){S=JSON.parse(UNDO);UNDO=null;save();render();if(ADD)drawAdd();toast('ยกเลิกแล้ว')} break;
   case 'add': openAdd(b.dataset.meal||autoMeal()); break;
   case 'quick': addFood(foodById(b.dataset.id),autoMeal()); break;
   case 'pick': addFood(foodById(b.dataset.id),ADD.meal); break;
   case 'fav':{const id=b.dataset.id;S.favs=S.favs.includes(id)?S.favs.filter(x=>x!==id):S.favs.concat(id);save();drawAdd();render();break}
   case 'pickMeal': ADD.meal=b.dataset.m; drawAdd(); break;
   case 'pickCat': ADD.cat=b.dataset.c; drawAdd(); break;
   case 'customForm': customForm(); break;
   case 'saveCustom':{
     const n=document.getElementById('cName').value.trim(), k=gv('cK'), fav=document.getElementById('cFav').checked;
     if(!n||!(k>=0)){document.getElementById('cErr').textContent='ใส่ชื่อเมนูและแคลอรีก่อน แล้วกดบันทึกอีกครั้ง';break}
     const food={id:'c'+Date.now(),name:n,kcal:Math.round(k),p:gv('cP')||0,c:gv('cC')||0,f:gv('cF')||0,cat:'mine',tags:[]};
     const meal=ADD.meal; act(()=>{S.custom.unshift(food);if(fav)S.favs.unshift(food.id);day().foods.push(logOf(food,meal))},`เพิ่ม ${n}`); closeSheet(); break;}
   case 'qty':{const i=+b.dataset.i;act(()=>{const x=day().foods[i];x.qty=r1(x.qty+parseFloat(b.dataset.d));if(x.qty<=0)day().foods.splice(i,1)},'แก้ปริมาณแล้ว');break}
   case 'water': act(()=>{const d=day();d.water=Math.max(0,d.water+(+b.dataset.d))},'ดื่มน้ำ 1 แก้ว'); break;
   case 'steps': numberSheet('steps'); break;
   case 'sleep': numberSheet('sleep'); break;
   case 'stepAdd':{const i=document.getElementById('stIn');i.value=(parseInt(i.value)||0)+(+b.dataset.v);break}
   case 'saveSteps':{const v=parseInt(document.getElementById('stIn').value)||0;act(()=>day().steps=Math.max(0,Math.min(v,100000)),'บันทึกก้าวเดินแล้ว');closeSheet();break}
   case 'sleepD':{const el=document.getElementById('slV');el.textContent=Math.max(0,Math.min(14,parseFloat(el.textContent)+(+b.dataset.v)));break}
   case 'saveSleep':{const v=parseFloat(document.getElementById('slV').textContent);act(()=>day().sleep=v,'บันทึกการนอนแล้ว');closeSheet();break}
   case 'weigh': weighSheet(); break;
   case 'goals': goalsSheet(); break;
   case 'sex': document.getElementById('pSex').value=b.dataset.v; b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); recalcProfile(); break;
   case 'accent': b.parentNode.querySelectorAll('.acc').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)}); document.documentElement.dataset.accent=b.dataset.v; b.parentNode.dataset.v=b.dataset.v; break;
   case 'saveGoals':{
     const p=readProfile(), err=document.getElementById('pErr'), kcal=gv('pK');
     if(!(p.age>=15&&p.age<=90))err.textContent='อายุต้องอยู่ระหว่าง 15–90 ปี';
     else if(!(p.height>=120&&p.height<=220))err.textContent='ส่วนสูงต้องอยู่ระหว่าง 120–220 ซม.';
     else if(!(p.weight>=30&&p.weight<=250)||!(p.goal>=30&&p.goal<=250))err.textContent='น้ำหนักต้องอยู่ระหว่าง 30–250 กก.';
     else if(!(kcal>=1000))err.textContent='เป้าแคลอรีควรไม่ต่ำกว่า 1,000 kcal เพื่อความปลอดภัย';
     else{const acc=document.querySelector('.accents').dataset.v||S.profile.accent;
       act(()=>Object.assign(S.profile,p,{kcal:Math.round(kcal),protein:Math.round(gv('pP'))||calcTargets(p).protein,water:Math.max(1,Math.round(gv('pWa'))||8),
        steps:Math.max(500,Math.round(gv('pSt'))||8000),sleep:Math.max(4,gv('pSl')||7),wpw:Math.max(1,Math.min(7,Math.round(gv('pWpw'))||3)),waistGoal:gv('pWg')||0,accent:acc}),'บันทึกเป้าหมายแล้ว',{quiet:true});closeSheet()}
     break;}
   case 'saveW':{
     const v=gv('wIn');
     if(!(v>=30&&v<=250)){document.getElementById('wErr').textContent='ใส่น้ำหนักระหว่าง 30–250 กก.';break}
     act(()=>{S.weights=S.weights.filter(w=>w.d!==CUR);S.weights.push({d:CUR,kg:r1(v)});const last=S.weights.slice().sort((a,b)=>a.d<b.d?-1:1).pop();S.profile.weight=last.kg;day().weighed=true},'บันทึกน้ำหนักแล้ว');closeSheet();break;}
   case 'saveWaist':{
     const v=gv('waIn');
     if(!(v>=40&&v<=200)){document.getElementById('waErr').textContent='ใส่รอบเอวระหว่าง 40–200 ซม.';break}
     act(()=>{const k=dk();S.waist=S.waist.filter(w=>w.d!==k);S.waist.push({d:k,cm:r1(v)})},'บันทึกรอบเอวแล้ว');break;}
   case 'adaptApply': act(()=>{S.profile.kcal=+b.dataset.v;S.adaptSeen=dk()},`ตั้งเป้าใหม่ ${fmt(+b.dataset.v)} kcal แล้ว`,{quiet:true}); break;
   case 'adaptKeep': act(()=>{S.adaptSeen=dk()},'คงเป้าเดิมไว้ อีก 7 วันจะเช็กให้ใหม่',{quiet:true}); break;
   case 'backup':{
     const code=encodeBackup(), out=document.getElementById('bkOut');
     const done=()=>{S.lastBackup=dk();save();toast('คัดลอกรหัสสำรองแล้ว ไปวางเก็บไว้ได้เลย');setTimeout(render,600)};
     const fallback=()=>{out.innerHTML=`<p class="small">คัดลอกรหัสด้านล่างไปเก็บไว้</p><textarea class="code" readonly aria-label="รหัสสำรอง">${code}</textarea>`;const ta=out.querySelector('textarea');ta.focus();ta.select();S.lastBackup=dk();save()};
     try{navigator.clipboard.writeText(code).then(done,fallback)}catch(err){fallback()}
     break;}
   case 'restoreSheet': restoreSheet(); break;
   case 'installHelp': installSheet(); break;
   case 'installHide': S.installHide=true; save(); closeSheet(); render(); break;
   case 'health': healthSheet(); break;
   case 'healthSetup': healthSetupSheet(); break;
   case 'healthRun': location.href='shortcuts://run-shortcut?name='+encodeURIComponent(HEALTH_SHORTCUT); break;
   case 'healthPaste':{
     const err=document.getElementById('hErr');
     if(!navigator.clipboard||!navigator.clipboard.readText){err.textContent='เครื่องนี้อ่านคลิปบอร์ดไม่ได้ ใช้ "วางเองแบบกดค้าง" แทน';break}
     navigator.clipboard.readText().then(t=>{const m=importHealth(t);const e2=document.getElementById('hErr');if(m&&e2)e2.textContent=m},()=>{const e2=document.getElementById('hErr');if(e2)e2.textContent='ยังอ่านคลิปบอร์ดไม่ได้ ลองแตะ "วาง" ที่ iPhone ถามอีกครั้ง หรือใช้ "วางเองแบบกดค้าง"'});
     break;}
   case 'healthPasteText':{const m=importHealth(document.getElementById('hIn').value);if(m)document.getElementById('hErr').textContent=m;break}
   case 'backupFile':{
     const json=JSON.stringify(S), file=new File([json],backupFileName(),{type:'application/json'});
     const mark=()=>{S.lastBackup=dk();save();render()};
     if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:'PawFit backup'}).then(()=>{mark();toast('ส่งไฟล์สำรองแล้ว')},()=>{})}
     else{const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=backupFileName();document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);mark();toast('ดาวน์โหลดไฟล์สำรองแล้ว')}
     break;}
   case 'imgSheet': imgSheet(); break;
   case 'imgDel':{const k=b.dataset.k,sb=document.getElementById('sb'),sc=sb?sb.scrollTop:0;IDB.del(k).then(()=>{setImgURL(k,null);imgSheet(`ลบรูป ${slotLabel(k)} แล้ว กลับไปใช้ภาพวาดเดิม`);const n=document.getElementById('sb');if(n)n.scrollTop=sc;render()});break}
   case 'restore':{
     const err=document.getElementById('rErr'); let o;
     try{o=migrate({...decodeBackup(document.getElementById('rIn').value),example:false})}catch(x){o=null}
     if(!o){err.textContent='รหัสไม่ถูกต้อง ลองคัดลอกใหม่ให้ครบทั้งหมดแล้ววางอีกครั้ง';break}
     if(!b.dataset.armed){b.dataset.armed='1';b.textContent='แตะอีกครั้งเพื่อแทนที่ข้อมูลเดิม';break}
     S=o;save();closeSheet();CUR=dk();render(true);toast('กู้คืนข้อมูลเรียบร้อย');break;}
   case 'reset':
     if(b.dataset.armed){const prof=S.profile;S=blankState(prof,{name:S.pet.name});save();CUR=dk();render(true);toast('ล้างประวัติแล้ว เริ่มใหม่กัน')}
     else{b.dataset.armed='1';b.textContent='แตะอีกครั้งเพื่อยืนยัน';setTimeout(()=>{if(b.isConnected&&b.dataset.armed){delete b.dataset.armed;render()}},3500)}
     break;
   case 'onboard': OB=null; showOB(1); break;
   case 'ob': {const v=+b.dataset.v; if(OB.step===2&&v===1)OB.t=null; showOB(v); break}
   case 'obSkip': S.obSeen=true; save(); hideOB(); break;
   case 'obSex': OB.p.sex=b.dataset.v; b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); break;
   case 'ob1':{
     const p={sex:OB.p.sex,age:gv('oAge'),height:gv('oH'),weight:gv('oW'),goal:gv('oG'),activity:gv('oA')}, err=document.getElementById('oErr');
     if(!(p.age>=15&&p.age<=90)){err.textContent='อายุต้องอยู่ระหว่าง 15–90 ปี';break}
     if(!(p.height>=120&&p.height<=220)){err.textContent='ส่วนสูงต้องอยู่ระหว่าง 120–220 ซม.';break}
     if(!(p.weight>=30&&p.weight<=250)||!(p.goal>=30&&p.goal<=250)){err.textContent='น้ำหนักต้องอยู่ระหว่าง 30–250 กก.';break}
     OB.p=p; OB.t=null; showOB(2); break;}
   case 'ob2':{
     const k=gv('oK'), err=document.getElementById('oErr');
     if(!(k>=1000)){err.textContent='เป้าแคลอรีควรไม่ต่ำกว่า 1,000 kcal เพื่อความปลอดภัย';break}
     OB.t={...OB.t,kcal:Math.round(k),protein:Math.round(gv('oP'))||OB.t.protein,water:Math.max(1,Math.round(gv('oWa'))||OB.t.water)}; OB.wpw=Math.max(1,Math.min(7,Math.round(gv('oWpw'))||3)); showOB(3); break;}
   case 'obPace': document.getElementById('oK').value=b.dataset.v; obGuide(); break;
   case 'obSkin': OB.skin=b.dataset.v; OB.name=document.getElementById('oName').value; drawOB(); break;
   case 'obDone':{
     const name=document.getElementById('oName').value.trim()||'ข้าวปั้น';
     const prof={...OB.p,...DEF_GOALS,kcal:OB.t.kcal,protein:OB.t.protein,water:OB.t.water,wpw:OB.wpw||3,accent:S.profile.accent||'leaf'};
     S=blankState(prof,{name,owned:[OB.skin],equip:{head:null,face:null,skin:OB.skin}});
     S.weights=[{d:dk(),kg:OB.p.weight}]; day(dk()).weighed=true;
     save(); CUR=dk(); TAB='today'; hideOB(); render(true); OB=null;
     toast(`ยินดีต้อนรับ! ${name} พร้อมแล้ว`,5); burst(innerWidth/2,innerHeight/3,44); break;}
   case 'rename': openSheet('ตั้งชื่อน้องแมว',`<label class="field" for="petN">ชื่อ<input id="petN" type="text" maxlength="16" value="${esc(S.pet.name)}"></label><button class="btn" data-act="saveName">บันทึก</button>`); break;
   case 'saveName':{const n=document.getElementById('petN').value.trim();if(n){act(()=>S.pet.name=n,'เปลี่ยนชื่อแล้ว');closeSheet()}break}
   case 'petTap':{
     b.classList.remove('jump');void b.offsetWidth;b.classList.add('jump');const r=b.getBoundingClientRect();heart(r.left+r.width/2,r.top+r.height*.3);setTimeout(()=>heart(r.left+r.width/2+16,r.top+r.height*.3),140);
     const L=petLines(), bub=document.getElementById('bubble'); if(bub&&L.length){petTap.i=((petTap.i||0)+1)%L.length;bub.textContent=L[petTap.i]}
     break;}
   case 'buy':{const it=SHOP.find(x=>x.id===b.dataset.id);
     if(coins()<it.price){toast(`ยังขาดอีก ${it.price-coins()} เหรียญ ทำภารกิจเพิ่มนะ`);break}
     act(()=>{S.pet.spent+=it.price;S.pet.owned.push(it.id);if(it.slot==='skin')S.pet.equip.skin=it.id;else S.pet.equip[it.slot]=it.id},`ได้${it.name}แล้ว`);burst(...lastXY,24);break}
   case 'equip':{const it=SHOP.find(x=>x.id===b.dataset.id);
     act(()=>{const eq=S.pet.equip;if(it.slot==='skin')eq.skin=eq.skin===it.id?(S.pet.owned.find(o=>SKINS[o]&&o!==it.id)||'orange'):it.id;else eq[it.slot]=eq[it.slot]===it.id?null:it.id},'เปลี่ยนชุดแล้ว');break}
   case 'session': sessionSheet(); break;
   case 'mini': timedSheet('mini'); break;
   case 'stretch': timedSheet('stretch'); break;
   case 'set': b.classList.toggle('on'); b.setAttribute('aria-pressed',b.classList.contains('on')); if(b.classList.contains('on'))startRun([{l:'พักระหว่างเซต',s:60}],()=>toast('หมดเวลาพัก ลุยเซตต่อไป')); break;
   case 'rest': startRun([{l:'พักระหว่างเซต',s:60}],()=>toast('หมดเวลาพัก ลุยเซตต่อไป')); break;
   case 'runCardio': startRun(cardioSegs(sessionInfo(S.program.done).week),()=>toast('ครบแล้ว! กดบันทึกได้เลย')); break;
   case 'runMini': startRun(miniSegs(),()=>toast('ครบ 10 นาที! กดบันทึกได้เลย')); break;
   case 'runStretch': startRun(stretchSegs(),()=>toast('ตัวเบาขึ้นแล้ว กดบันทึกได้เลย')); break;
   case 'finish':{const s=sessionInfo(S.program.done);finishWorkout(s.type,s.title,s.min,true);break}
   case 'finishMini': finishWorkout('M','10 นาทีวันขี้เกียจ',10,false); break;
   case 'finishStretch': finishWorkout('S','ยืดเหยียด',5,false); break;
   case 'rPause': if(RUN){RUN.paused=!RUN.paused;drawRun()} break;
   case 'rSkip': if(RUN){RUN.el+=RUN.left-1;RUN.left=1;tick()} break;
   case 'rStop': stopRun(); break;
  }
});
function petTap(){}
document.addEventListener('input',e=>{
  const id=e.target.id;
  if(id==='q'&&ADD){ADD.q=e.target.value;drawAdd()}
  if(id==='oK'&&OB)obGuide();
  if(['pK','pP','pWa'].includes(id))e.target.dataset.touched='1';
  if(['pAge','pH','pW','pG'].includes(id))recalcProfile();
});
document.addEventListener('change',async e=>{
  if(e.target.id==='imgBg'){IMGBG=e.target.checked;return}
  if(e.target.id==='rFile'){const f=e.target.files[0];if(!f)return;const t=await f.text();const ta=document.getElementById('rIn');if(ta)ta.value=t;const err=document.getElementById('rErr');if(err)err.textContent='โหลดไฟล์แล้ว แตะ "กู้คืนข้อมูล" เพื่อยืนยัน';return}
  if(e.target.id==='imgMulti'||e.target.dataset.slot){
    const files=[...e.target.files]; if(!files.length)return;
    const slots=new Set(allSlots()), pairs=[], miss=[];
    if(e.target.dataset.slot) pairs.push([e.target.dataset.slot,files[0]]);
    else files.forEach(f=>{const k=normName(f.name); slots.has(k)?pairs.push([k,f]):miss.push(f.name)});
    const sc=document.getElementById('sb')?.scrollTop||0;
    const r=await addImages(pairs);
    let m=r.ok?`ใส่รูปแล้ว ${r.ok} ภาพ`:'ยังไม่ได้ใส่รูป';
    if(miss.length) m+=` · ชื่อไฟล์ไม่ตรงกับช่องไหน ${miss.length} ไฟล์: ${miss.slice(0,4).join(', ')}${miss.length>4?' …':''} ลองเปลี่ยนชื่อให้ตรง หรือกดใส่ทีละช่องแทน`;
    if(r.bad.length) m+=` · เปิดไฟล์ไม่ได้: ${r.bad.join(', ')}`;
    imgSheet(m); const sb=document.getElementById('sb'); if(sb)sb.scrollTop=sc; render();
    if(r.ok) toast(`ใส่รูปแล้ว ${r.ok} ภาพ`);
    return;
  }
  if(e.target.id==='pA')recalcProfile();
  if(e.target.dataset.lift){const v=parseFloat(e.target.value);if(v>=0){S.lifts[e.target.dataset.lift]=v;save()}}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sheet.classList.contains('open'))closeSheet()});
render(true);
if(!S.onboarded&&!S.obSeen) showOB(0);
loadImgs().then(()=>{if(Object.keys(IMGURL).length){render();if(!document.getElementById('ob').hidden&&OB)drawOB()}});

setupPWA();
