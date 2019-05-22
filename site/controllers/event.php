<?php
// No direct access
defined('_JEXEC') or die('Restricted access');

/**
 * Event Controller for PvDemos Component
 *
 * @package    Philadelphia.Votes
 * @subpackage Components
 * @license    GNU/GPL
 */
class PvdemosControllerEvent extends PvdemosController
{
    /**
     * Bind tasks to methods
     * @return void
     */
    public function __construct()
    {
        parent::__construct();

        // Register Extra tasks
        $this->registerTask('add', 'edit');
        $this->registerTask('update', 'save');
    }

    /**
     * Save a record (and redirect to main page)
     *
     * @return void
     */
    public function save()
    {
        $model->store();

        // Let's go back to the default view
//        $link = 'index.php?option=com_pvdemos';
//        $this->setRedirect($link, $msg);
    }
}
