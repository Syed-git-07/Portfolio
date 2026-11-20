import { PNG } from "pngjs";

// Coordinates are tenths of a pad pixel; nib widths are hundredths.
export function validSignature(strokes) {
  if (!Array.isArray(strokes) || !strokes.length || strokes.length > 2000) return false;
  let points = 0, distance = 0;
  for (const stroke of strokes) {
    if (!Array.isArray(stroke) || !stroke.length || (points += stroke.length) > 2000) return false;
    for (const [i, point] of stroke.entries()) {
      if (!Array.isArray(point) || point.length !== 3 || !point.every(Number.isInteger)) return false;
      const [x,y,w] = point;
      if(x<0||x>3000||y<0||y>1800||w<1||w>800)return false;
      if(i)distance+=Math.hypot(x-stroke[i-1][0],y-stroke[i-1][1])/10;
    }
  }
  return distance <= 40000;
}

export function signatureImage(strokes) {
  const png = new PNG({width:600,height:360});
  png.data.fill(255);
  function dot(x,y,r){
    for(let j=Math.max(0,Math.floor(y-r-1));j<Math.min(360,y+r+1);j++)
      for(let i=Math.max(0,Math.floor(x-r-1));i<Math.min(600,x+r+1);i++){
        const coverage=Math.min(1,Math.max(0,r+.5-Math.hypot(i+.5-x,j+.5-y)));
        const k=(j*600+i)*4;
        const ink=Math.min(png.data[k],Math.round(255-225*coverage));
        png.data[k]=png.data[k+1]=png.data[k+2]=ink;
      }
  }
  for(const stroke of strokes){
    const pts=stroke.map(([x,y,w])=>[x/5,y/5,w/100]);
    if(pts.length===1){dot(...pts[0]);continue;}
    for(let i=1;i<pts.length;i++){
      const a=pts[i-1], b=pts[i], prev=pts[Math.max(0,i-2)];
      const start=i===1?a:[(prev[0]+a[0])/2,(prev[1]+a[1])/2];
      const end=i===pts.length-1?b:[(a[0]+b[0])/2,(a[1]+b[1])/2];
      const steps=Math.max(1,Math.ceil(Math.hypot(start[0]-a[0],start[1]-a[1])+Math.hypot(end[0]-a[0],end[1]-a[1])));
      for(let j=0;j<=steps;j++){
        const t=j/steps,u=1-t;
        dot(u*u*start[0]+2*u*t*a[0]+t*t*end[0],u*u*start[1]+2*u*t*a[1]+t*t*end[1],(a[2]+b[2])/2);
      }
    }
  }
  return PNG.sync.write(png);
}
