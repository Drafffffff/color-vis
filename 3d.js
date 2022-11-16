import "./style.css";
import data from "./colors.csv";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { map, lab2rgb } from "./utils.js";
import { colord, extend } from "colord";
import labPlugin from "colord/plugins/lab";
import { qing, chi, huang, bai, hei } from "./meshpoints";
import { json } from "d3";

// console.log(data.filter(d=>d.subparent==="棕"))
let colorsData = data;
extend([labPlugin]);
const mySelect = document.querySelector("#mySelect");
mySelect.add(new Option("全部"));
let op = [];
data.forEach(d => {
  op.push(d.subparent);
});
op = Array.from(new Set(op));
op.forEach(d => {
  mySelect.add(new Option(d));
});

const meshSelect = document.querySelector("#meshSelect");
const meshMatselect = document.querySelector("#meshMatSelect");
meshMatselect.add(new Option("显示线框"));
meshMatselect.add(new Option("显示面"));



meshSelect.add(new Option("不显示边界"));
meshSelect.add(new Option("青"));
meshSelect.add(new Option("赤"));
meshSelect.add(new Option("黄"));
meshSelect.add(new Option("白"));
meshSelect.add(new Option("黑"));
meshSelect.add(new Option("显示全部边界"));

meshMatselect.addEventListener("change", onMeshMatChangeOption);
meshSelect.addEventListener("change", onMeshChangeOption);
mySelect.addEventListener("change", onChangeOption);
// const colorsData = data
// console.log(data)
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const canvas = document.querySelector(".webgl");
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const geo = new THREE.EdgesGeometry(geometry);
const mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
const mesh = new THREE.LineSegments(geo, mat);
mesh.position.set(0.5, 0.5, 0.5);
scene.add(mesh);

//-----------------边界

const boundaryQing = new THREE.BufferGeometry();
boundaryQing.setAttribute("position", new THREE.BufferAttribute(qing, 3));

const boundaryChi = new THREE.BufferGeometry();
boundaryChi.setAttribute("position", new THREE.BufferAttribute(chi, 3));

const boundaryHuang = new THREE.BufferGeometry();
boundaryHuang.setAttribute("position", new THREE.BufferAttribute(huang, 3));

const boundaryBai = new THREE.BufferGeometry();
boundaryBai.setAttribute("position", new THREE.BufferAttribute(bai, 3));

const boundaryHei = new THREE.BufferGeometry();
boundaryHei.setAttribute("position", new THREE.BufferAttribute(hei, 3));

const mqing = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  wireframe: true,
});
const mchi = new THREE.MeshBasicMaterial({
  color: 0xed1a3d,
  wireframe: true,
});
const mhuang = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  wireframe: true,
});
const mbai = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});
const mhei = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
});

const MeshQing = new THREE.Mesh(boundaryQing, mqing);
const MeshChi = new THREE.Mesh(boundaryChi, mchi);
const MeshHuang = new THREE.Mesh(boundaryHuang, mhuang);
const MeshBai = new THREE.Mesh(boundaryBai, mbai);
const MeshHei = new THREE.Mesh(boundaryHei, mhei);
scene.add(MeshQing, MeshChi, MeshHuang, MeshBai, MeshHei);
const group = new THREE.Group();
colorsData.forEach((d, i) => {
  const c = colord({ l: d.l, a: d.a, b: d.b }).toHex();
  const sprite1 = new THREE.Sprite(new THREE.SpriteMaterial({ color: c }));
  const x = map(d.l, 0, 100, 0, 1, true);
  const y = map(d.a, -128, 127, 0, 1, true);
  const z = map(d.b, -128, 127, 0, 1, true);
  sprite1.position.set(x, y, z);
  sprite1.scale.set(0.05, 0.05, 0.05);
  sprite1.colorIndex = i;
  group.add(sprite1);
});

scene.add(group);

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const camera = new THREE.PerspectiveCamera(45, size.width / size.height);
camera.position.z = 2;
camera.position.x = 2;
camera.position.y = 2;
scene.add(camera);
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(size.width, size.height);
scene.add(new THREE.AxesHelper(1.5));
scene.background = new THREE.Color(0x555555);
onMeshChangeOption()
animate();

function animate() {
  render();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", onWindowResize);
canvas.addEventListener("pointermove", onPointerMove);

function render() {
  renderer.render(scene, camera);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", render); // use if there is no animation loop
controls.minDistance = 2;
controls.maxDistance = 10;
controls.target.set(0, 0, -0.2);
controls.update();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

let selectedObject = null;

function onPointerMove(event) {
  if (selectedObject) {
    selectedObject.scale.set(0.05, 0.05, 0.05);
    selectedObject = null;
  }

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(group, true);

  if (intersects.length > 0) {
    const res = intersects.filter(function (res) {
      return res && res.object;
    })[0];

    if (res && res.object) {
      // console.log(res.object)
      selectedObject = res.object;
      const d = colorsData[selectedObject.colorIndex];
      // console.log(d)
      setInfo(d["﻿color"], d.l, d.a, d.b, d.from);
      selectedObject.scale.set(0.1, 0.1, 0.1);
    }
  }
}

function setInfo(name, l, a, b, from) {
  document.querySelector("#name").innerHTML = name;
  document.querySelector("#l").innerHTML = l;
  document.querySelector("#a").innerHTML = a;
  document.querySelector("#b").innerHTML = b;
  document.querySelector("#from").innerHTML = from;
}

function onChangeOption(d) {
  const index = d.srcElement.selectedIndex;
  const val = d.srcElement.options[index].text;
  if (index === 0) {
    colorsData = data;
  } else {
    colorsData = data.filter(d => d.subparent === val);
  }
  group.clear();
  colorsData.forEach((d, i) => {
    const c = colord({ l: d.l, a: d.a, b: d.b }).toHex();
    const sprite1 = new THREE.Sprite(new THREE.SpriteMaterial({ color: c }));
    const x = map(d.l, 0, 100, 0, 1, true);
    const y = map(d.a, -128, 127, 0, 1, true);
    const z = map(d.b, -128, 127, 0, 1, true);
    sprite1.position.set(x, y, z);
    sprite1.scale.set(0.05, 0.05, 0.05);
    sprite1.colorIndex = i;
    group.add(sprite1);
  });
}

function onMeshChangeOption(d) {
  const index = d.srcElement.selectedIndex;
  const val = d.srcElement.options[index].text;
  if (val === "青") {
    mqing.visible = true
    mchi.visible = false
    mhuang.visible = false
    mbai.visible = false
    mhei.visible = false
  } else if (val === "赤") {
    mqing.visible = false
    mchi.visible = true
    mhuang.visible = false
    mbai.visible = false
    mhei.visible = false
  } else if (val === "黄") {
    mqing.visible = false
    mchi.visible = false
    mhuang.visible = true
    mbai.visible = false
    mhei.visible = false
  } else if (val === "白") {
    mqing.visible = false
    mchi.visible = false
    mhuang.visible = false
    mbai.visible = true
    mhei.visible = false
  } else if (val === "黑") {
    mqing.visible = false
    mchi.visible = false
    mhuang.visible = false
    mbai.visible = false
    mhei.visible = true
  } else if (val === "不显示边界") {
    mqing.visible = false
    mchi.visible = false
    mhuang.visible = false
    mbai.visible = false
    mhei.visible = false
  } else if (val === "显示全部边界") {
    mqing.visible = true
    mchi.visible = true
    mhuang.visible = true
    mbai.visible = true
    mhei.visible = true
  }
}


function onMeshMatChangeOption(d){
    const index = d.srcElement.selectedIndex;
    const val = d.srcElement.options[index].text;
    if(val ==="显示线框"){
        mqing.wireframe=true
        mchi.wireframe=true
        mhuang.wireframe=true
        mbai.wireframe=true
        mhei.wireframe=true
    }else if("显示面"){
        mqing.wireframe=false
        mchi.wireframe=false
        mhuang.wireframe=false
        mbai.wireframe=false
        mhei.wireframe=false
    }
}