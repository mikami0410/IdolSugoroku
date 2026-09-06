import * as THREE from "three";

export class Road{
    private road: THREE.Mesh;

    constructor(startX: number, startZ: number, endX: number, endZ: number, scene: THREE.Scene, dx: number, dz: number){
        const start = new THREE.Vector3(startX, 0, startZ);
        const center = new THREE.Vector3((startX+endX)/2+(endX-startX)*dx, 0, (startZ+endZ)/2+(endZ-startZ)*dz);
        const end = new THREE.Vector3(endX, 0, endZ);
        const curve = new THREE.QuadraticBezierCurve3(start, center, end);
        const points = curve.getPoints(60);
        const vertices: number[] = [];
        for(let i = 0; i < points.length-1; i++){
            const p1 = points[i];
            const p2 = points[i+1];
            const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
            const directionYoko = new THREE.Vector3(-direction.z, 0, direction.x);
            const width = 0.9;
            const left1 = p1.clone().add(directionYoko.clone().multiplyScalar(width/2));
            const right1 = p1.clone().add(directionYoko.clone().multiplyScalar(-width/2));
            const left2 = p2.clone().add(directionYoko.clone().multiplyScalar(width/2));
            const right2 = p2.clone().add(directionYoko.clone().multiplyScalar(-width/2));
            vertices.push(
                left1.x, left1.y, left1.z,
                right1.x, right1.y, right1.z,
                left2.x, left2.y, left2.z,
                right1.x, right1.y, right1.z,
                right2.x, right2.y, right2.z,
                left2.x, left2.y, left2.z
            )
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();
        const material = new THREE.MeshBasicMaterial({color: 0xcccccc, side: THREE.DoubleSide});
        this.road = new THREE.Mesh(geometry, material);
        scene.add(this.road);
    }
}