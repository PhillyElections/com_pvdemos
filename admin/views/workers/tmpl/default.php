<?php
defined('_JEXEC') or die('Restricted access');

$pagination = &$this->pagination;
$workers      = $this->workers;

?>
<form action="<?=JRoute::_('index.php?option=com_pvdemos');?>" method="post" name="adminForm" id="adminForm">
    <div id="editcell">
        <table class="adminlist">
            <thead>
                <tr>
                    <th width="1px">
                        <?=JText::_('ID');?>
                    </th>
                    <th width="1px">
                        <input type="checkbox" name="toggle" value="" onclick="checkAll(<?=count($workers);?>);" />
                    </th>
                    <th width="1px">
                        P
                    </th>
                    <th width="7%">
                        <?=JText::_('JOB');?>
                    </th>
                    <th width="20%">
                        <?=JText::_('NAME');?>
                    </th>
                    <th width="20%">
                        <?=JText::_('EMAIL');?>
                    </th>
                    <th width="10%">
                        <?=JText::_('PHONE');?>
                    </th>
                    <th width="10%">
                        <?=JText::_('UDPATED');?>
                    </th>
                    <th width="10%">
                        <?=JText::_('CREATED');?>
                    </th>
                    <th width="auto">
                        &nbsp;
                    </th>
                </tr>
            </thead>
            <tbody>
            <?php
$k = 0;
for ($i = 0, $n = count($workers); $i < $n; $i++) {
    $row     = &$workers[$i];
    $checked = JHTML::_('grid.id', $i, $row->id);
    $published = JHTML::_('grid.published', $row, $i);
    $link = JRoute::_('index.php?option=com_pvdemos&controller=worker&task=edit&cid[]='.$row->id);

            ?>
                <tr class="<?="row$k";?>">
                    <td>
                        <?=$row->id;?>
                    </td>
                    <td>
                        <?=$checked;?>
                    </td>
                    <td>
                        <?=$published;?>
                    </td>
                    <td>
                        <?=$row->job;?>
                    </td>
                    <td>
                        <a href="<?=$link?>"><?=$row->name;?></a>
                    </td>
                    <td>
                        <?=$row->phone;?>
                    </td>
                    <td>
                        <?=$row->email;?>
                    </td>
                    <td>
                        <?=$row->updated;?>
                    </td>
                    <td>
                        <?=$row->created;?>
                    </td>
                    <td>
                        &nbsp;
                    </td>
                </tr>
            <?php
$k = 1 - $k;
}
?>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="10"><?php echo $pagination->getListFooter(); ?></td>
                </tr>
            </tfoot>
        </table>
    </div>
    <?=JHTML::_('form.token');?>
    <input type="hidden" name="task" value="" />
    <input type="hidden" name="boxchecked" value="0" />
    <input type="hidden" name="controller" value="worker" />
    <?=JHTML::_('form.token');?>
</form>
