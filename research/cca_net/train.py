import argparse,torch
from torch.utils.data import DataLoader
from .model import CCANet
from .mit_b2 import MiTB2Encoder
from .dataset import CoralSegmentationDataset,boundary_from_mask
from .losses import cca_loss

def collate(batch):
 # Research images should be preprocessed to a common training size before this minimal trainer.
 return torch.stack([x for x,_ in batch]),torch.stack([y for _,y in batch])

def main():
 p=argparse.ArgumentParser();p.add_argument('--images',required=True);p.add_argument('--encoder',choices=['portable','mit-b2'],default='mit-b2');p.add_argument('--masks',required=True);p.add_argument('--classes',type=int,default=39);p.add_argument('--epochs',type=int,default=20);p.add_argument('--batch-size',type=int,default=2);p.add_argument('--lr',type=float,default=1e-4);p.add_argument('--out',default='cca_net_checkpoint.pt');a=p.parse_args()
 dev='cuda' if torch.cuda.is_available() else 'cpu';ds=CoralSegmentationDataset(a.images,a.masks);dl=DataLoader(ds,batch_size=a.batch_size,shuffle=True,collate_fn=collate);enc=MiTB2Encoder() if a.encoder=='mit-b2' else None;m=CCANet(a.classes,encoder=enc,encoder_dims=(64,128,320,512) if enc else (32,64,160,256)).to(dev);opt=torch.optim.AdamW(m.parameters(),lr=a.lr)
 for epoch in range(a.epochs):
  m.train();total=0.
  for x,y in dl:
   x,y=x.to(dev),y.to(dev);b=torch.stack([boundary_from_mask(z) for z in y]);out=m(x);loss,_=cca_loss(out,y,b);opt.zero_grad();loss.backward();opt.step();total+=loss.item()
  print(f'epoch {epoch+1:03d} loss={total/max(len(dl),1):.4f}')
 torch.save({'model':m.state_dict(),'classes':a.classes},a.out);print('saved',a.out)
if __name__=='__main__':main()
