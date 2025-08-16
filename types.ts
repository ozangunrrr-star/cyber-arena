export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Vector2;
  angle: number;
}

export interface BulletState {
  id: number;
  position: Vector2;
  velocity: Vector2;
}

export interface TargetState {
  id: number;
  position: Vector2;
  radius: number;
}
