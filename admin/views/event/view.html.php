<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Item View for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosViewEvent extends JView
{
    /**
     * display method of Item view
     * @return void
     **/
    public function display($tpl = null)
    {

        // bring in classes
        $model = $this->getModel('Workers');
        $workers = $model->getData();
        $this->assignRef('workers', $workers);

        $item = &$this->get('Data');

        $isNew = ($item->id < 1);

        $text = $isNew ? JText::_('New') : JText::_('Edit');
        JToolBarHelper::title(JText::_('Item') . ': <small><small>[ ' . $text . ' ]</small></small>');
        if ($isNew) {
            JToolBarHelper::save('save', 'Register');
            JToolBarHelper::cancel('cancel', 'Close');
            // We'll use a separate template for new items: default_add
            // $tpl = 'add';
        } else {
            // for existing items the button is renamed `close`
            JToolBarHelper::save('save', 'Update');
            JToolBarHelper::cancel('cancel', 'Close');
        }

        $this->assignRef('item', $item);
        $this->assignRef('isNew', $isNew);

        parent::display($tpl);
    }
}
