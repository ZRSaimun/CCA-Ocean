"""CCA-Net: colour-constancy and boundary-aware multi-task segmentation.

Implementation scaffold derived from the supplied paper abstract. Components not
fully specified in the abstract are explicit engineering choices and should be
aligned with the authors' full experimental code/config before reproduction claims.
"""
from __future__ import annotations
import torch
from torch import nn
import torch.nn.functional as F

class UnderwaterColourNormalisation(nn.Module):
    def __init__(self, channels=3):
        super().__init__()
        self.net=nn.Sequential(nn.Conv2d(channels,32,3,1,1),nn.GELU(),nn.Conv2d(32,32,3,1,1),nn.GELU(),nn.Conv2d(32,channels,3,1,1),nn.Tanh())
    def forward(self,x):
        return torch.clamp(x + .25*self.net(x),0,1)

class ConvEncoder(nn.Module):
    """Portable fallback encoder; replace with MiT-B2 for paper-aligned experiments."""
    def __init__(self):
        super().__init__(); dims=[32,64,160,256]; blocks=[]; c=3
        for d in dims: blocks.append(nn.Sequential(nn.Conv2d(c,d,3,2,1),nn.BatchNorm2d(d),nn.GELU(),nn.Conv2d(d,d,3,1,1),nn.GELU())); c=d
        self.blocks=nn.ModuleList(blocks)
    def forward(self,x):
        out=[]
        for b in self.blocks: x=b(x);out.append(x)
        return out

class BoundaryAwareDecoder(nn.Module):
    def __init__(self,num_classes,dims=(32,64,160,256),width=128):
        super().__init__(); self.proj=nn.ModuleList([nn.Conv2d(d,width,1) for d in dims]); self.fuse=nn.Sequential(nn.Conv2d(width*4,width,3,1,1),nn.GELU()); self.semantic=nn.Conv2d(width,num_classes,1);self.boundary=nn.Conv2d(width,1,1);self.coarse=nn.Conv2d(dims[-1],num_classes,1)
    def forward(self,features,out_size):
        size=features[0].shape[-2:]; xs=[F.interpolate(p(f),size=size,mode='bilinear',align_corners=False) for p,f in zip(self.proj,features)]; z=self.fuse(torch.cat(xs,1)); return {"semantic":F.interpolate(self.semantic(z),out_size,mode='bilinear',align_corners=False),"boundary":F.interpolate(self.boundary(z),out_size,mode='bilinear',align_corners=False),"coarse":F.interpolate(self.coarse(features[-1]),out_size,mode='bilinear',align_corners=False)}

class CCANet(nn.Module):
    def __init__(self,num_classes=39,encoder=None,encoder_dims=(32,64,160,256)):
        super().__init__();self.ucn=UnderwaterColourNormalisation();self.encoder=encoder or ConvEncoder();self.decoder=BoundaryAwareDecoder(num_classes,dims=encoder_dims)
    def forward(self,x):
        norm=self.ucn(x);out=self.decoder(self.encoder(norm),x.shape[-2:]);out["normalised"]=norm;return out
