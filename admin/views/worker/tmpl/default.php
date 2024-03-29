<?php
// no direct access
defined('_JEXEC') or die('Restricted access');

if (count(JRequest::getVar('msg', null, 'post'))) {
    foreach (JRequest::getVar('msg', null, 'post') as $msg) {
        JError::raiseWarning(1, $msg);
    }
}
d('worker: in default form', $this);
// try to cast to object next
$worker = !$this->isNew ? $this->worker : JRequest::get('post');

?>
<form action="<?=JRoute::_('index.php?option=com_pvdemos');?>" method="post" id="adminForm" name="adminForm" class="form-validate">
    <table cellpadding="0" cellspacing="0" border="0" class="adminform">
        <tbody>
            <tr>
                <td width="200" height="30">
                    <label id="namemsg" for="field">
                        <?=JText::_('FIELD');?>:
                    </label>
                </td>
                <td>
                    <input type="text" id="field" name="field" size="62" value="<?=$worker->field ? $worker->field : $worker['field'];?>" class="input_box required" maxlength="60" placeholder="<?=JText::_('FIELD PLACEHOLDER');?>" />
                </td>
            </tr>
            <tr>
                <td height="30">&nbsp;</td>
                <td>
                    <button class="button validate" type="submit"><?=$this->isNew ? JText::_('SUBMIT') : JText::_('UPDATE');?></button>
                    <input type="hidden" name="task" value="<?=$this->isNew ? 'save' : 'update';?>" />
                    <input type="hidden" name="controller" value="worker" />
                    <input type="hidden" name="id" value="<?=$worker->id;?>" />
                    <?=JHTML::_('form.token');?>
                </td>
            </tr>
        </tbody>
    </table>
</form>
