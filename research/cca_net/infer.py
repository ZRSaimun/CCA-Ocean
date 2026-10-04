from pathlib import Path
import argparse, torch
from PIL import Image
from torchvision.transforms.functional import pil_to_tensor,to_pil_image
from .model import CCANet

def main():
 p=argparse.ArgumentParser();p.add_argument('image');p.add_argument('--checkpoint',required=True);p.add_argument('--classes',type=int,default=39);p.add_argument('--out',default='prediction.png');a=p.parse_args()
 dev='cuda' if torch.cuda.is_available() else 'cpu';m=CCANet(a.classes).to(dev);state=torch.load(a.checkpoint,map_location=dev);m.load_state_dict(state.get('model',state));m.eval();x=pil_to_tensor(Image.open(a.image).convert('RGB')).float().div(255).unsqueeze(0).to(dev)
 with torch.no_grad(): y=m(x)['semantic'].argmax(1)[0].byte().cpu()
 to_pil_image(y).save(a.out);print(a.out)
if __name__=='__main__':main()
