import { Euler, Quaternion } from "three";

export class SmoothCamera {
  camera = null;
  lambda = 8; // higher = faster response
  #targetQuat = null;

  targetPos = null;
  get targetRot() {
    return new Euler().setFromQuaternion(this.#targetQuat);
  }
  set targetRot(rotation) {
    const euler = new Euler(rotation.x, rotation.y, rotation.z /* , "YXZ" */);
    this.#targetQuat = new Quaternion().setFromEuler(euler);
  }

  constructor(camera, startPos, startRot) {
    this.camera = camera;
    this.reset(startPos, startRot);
  }

  reset(startPos, startRot) {
    this.targetPos = startPos;
    this.targetRot = startRot;
    this.camera.position.set(this.targetPos.x, this.targetPos.y, this.targetPos.z);
    this.camera.quaternion.set(
      this.#targetQuat.x,
      this.#targetQuat.y,
      this.#targetQuat.z,
      this.#targetQuat.w,
    );
  }
  update(dt) {
    const alpha = 1 - Math.exp(-this.lambda * dt);

    const distance = this.camera.position.distanceTo(this.targetPos);
    if (Math.abs(distance) > 2) {
      this.camera.position.lerp(this.targetPos, alpha);
    }

    const angle = this.camera.quaternion.angleTo(this.#targetQuat);
    if (Math.abs(angle) > 0.1) {
      this.camera.quaternion.slerp(this.#targetQuat, alpha);
    }
  }
}
