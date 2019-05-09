<?php
defined('_JEXEC') or die('Restricted access');

$pagination = &$this->pagination;
$items      = $this->items;

?>
<form action="<?=JRoute::_('index.php?option=com_pvdemos');?>" method="post" name="adminForm" id="adminForm">
    <div id="editcell">
        <table class="adminlist">
            <thead>
                <tr>
                    <th width="5">
                        <?=JText::_('ID');?>
                    </th>
                    <th width="5">
                        <input type="checkbox" name="toggle" value="" onclick="checkAll(<?=count($items);?>);" />
                    </th>
                    <th width="5">
                        <?=JText::_('FIELD');?>
                    </th>
                </tr>
            </thead>
            <tbody>
            <?php
$k = 0;
for ($i = 0, $n = count($items); $i < $n; $i++) {
    $row     = &$items[$i];
    $checked = JHTML::_('grid.id', $i, $row->id);
    ?>
                <tr class="<?="row$k";?>">
                    <td>
                        <?=$row->id;?>
                    </td>
                    <td>
                        <?=$checked;?>
                    </td>
                    <td>
                        <?=$row->field;?>
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
    <input type="hidden" name="controller" value="item" />
    <?=JHTML::_('form.token');?>
</form>