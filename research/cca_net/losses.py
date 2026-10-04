import torch
import torch.nn.functional as F

def dice_loss(logits,target,eps=1e-6):
    n=logits.shape[1];p=logits.softmax(1);y=F.one_hot(target,n).permute(0,3,1,2).float();return 1-(2*(p*y).sum((0,2,3))+eps).mean()/((p+y).sum((0,2,3))+eps).mean()

def cca_loss(outputs,mask,boundary,w=(1.,1.,1.,.4)):
    ce=F.cross_entropy(outputs['semantic'],mask);dice=dice_loss(outputs['semantic'],mask);bce=F.binary_cross_entropy_with_logits(outputs['boundary'].squeeze(1),boundary.float());coarse=F.cross_entropy(outputs['coarse'],mask)
    total=w[0]*ce+w[1]*dice+w[2]*bce+w[3]*coarse
    return total,{"ce":ce.detach(),"dice":dice.detach(),"boundary_bce":bce.detach(),"coarse_ce":coarse.detach()}
